// Blockchain anchoring for Teevexa Trace supply chain events.
//
// Behaviour:
//   - If POLYGON_RPC_URL or POLYGON_PRIVATE_KEY are absent, returns immediately
//     with { anchored: false, reason: "blockchain_disabled" }.  This is the safe
//     default during beta — the app continues to work; anchoring is a no-op.
//   - When both env vars are present, hashes the canonical event JSON with
//     SHA-256, submits it as calldata to Polygon (data-only transaction, 0 MATIC
//     value), and writes the resulting tx hash to trace_events.blockchain_tx_hash.
//
// Called by:  field app after successfully inserting a trace_event.
// Input:      { eventId: string }
// Auth:       Bearer JWT (must be the field agent who recorded the event, or admin)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TEEVEXA_ANCHOR_ADDRESS = "0x0000000000000000000000000000000000000001";

async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Minimal RLP encoding for a Polygon EIP-2930 / legacy transaction
// We use a raw JSON-RPC approach so we don't need a full ethers bundle.

async function signAndSendTransaction(
  rpcUrl: string,
  privateKeyHex: string,
  data: string
): Promise<{ hash: string; confirm: () => Promise<void> }> {
  // Dynamically import ethers from esm.sh (works in Deno/Supabase edge runtime)
  const { ethers } = await import("https://esm.sh/ethers@6.13.0");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKeyHex, provider);

  const tx = await wallet.sendTransaction({
    to: TEEVEXA_ANCHOR_ADDRESS,
    value: 0n,
    data: "0x" + data,
  });

  // Return as soon as the tx is broadcast so the hash can be stored immediately;
  // waiting for the block could outlive the edge-function time limit and lose the hash.
  return { hash: tx.hash, confirm: async () => { await tx.wait(1); } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Graceful no-op when blockchain is not yet configured
    const rpcUrl = Deno.env.get("POLYGON_RPC_URL");
    const privateKey = Deno.env.get("POLYGON_PRIVATE_KEY");
    if (!rpcUrl || !privateKey) {
      return new Response(
        JSON.stringify({ anchored: false, reason: "blockchain_disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is the recording agent or an admin
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: event, error: fetchErr } = await adminClient
      .from("trace_events")
      .select("id, product_id, event_type, location, latitude, longitude, recorded_by, recorded_at, notes")
      .eq("id", eventId)
      .single();

    if (fetchErr || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only the recording agent or an admin may anchor
    if (event.recorded_by !== user.id) {
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin"]);
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Already anchored — return existing hash
    const { data: existing } = await adminClient
      .from("trace_events")
      .select("blockchain_tx_hash")
      .eq("id", eventId)
      .single();
    if (existing?.blockchain_tx_hash?.startsWith("pending:")) {
      return new Response(
        JSON.stringify({ anchored: false, reason: "already_in_progress_or_anchored" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (existing?.blockchain_tx_hash) {
      return new Response(
        JSON.stringify({ anchored: true, tx_hash: existing.blockchain_tx_hash, reused: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build canonical event fingerprint (sorted keys, no mutable fields)
    const canonical = JSON.stringify({
      id: event.id,
      product_id: event.product_id,
      event_type: event.event_type,
      location: event.location ?? null,
      latitude: event.latitude ?? null,
      longitude: event.longitude ?? null,
      recorded_by: event.recorded_by,
      recorded_at: event.recorded_at,
      notes: event.notes ?? null,
    });

    const hashHex = await sha256Hex(canonical);

    // Claim the event before spending gas so two concurrent calls can't both anchor it.
    // A "pending:" marker is written only if no hash exists yet; the loser of the race stops here.
    const claimMarker = `pending:${crypto.randomUUID()}`;
    const { data: claimed } = await adminClient
      .from("trace_events")
      .update({ blockchain_tx_hash: claimMarker })
      .eq("id", eventId)
      .is("blockchain_tx_hash", null)
      .select("id");
    if (!claimed || claimed.length === 0) {
      return new Response(
        JSON.stringify({ anchored: false, reason: "already_in_progress_or_anchored" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let txHash: string;
    let confirm: () => Promise<void>;
    try {
      ({ hash: txHash, confirm } = await signAndSendTransaction(rpcUrl, privateKey, hashHex));
    } catch (sendErr) {
      // Release the claim so the event can be retried
      await adminClient.from("trace_events").update({ blockchain_tx_hash: null }).eq("id", eventId).eq("blockchain_tx_hash", claimMarker);
      throw sendErr;
    }

    const { error: persistErr } = await adminClient
      .from("trace_events")
      .update({ blockchain_tx_hash: txHash })
      .eq("id", eventId)
      .eq("blockchain_tx_hash", claimMarker);
    if (persistErr) console.error("anchor-event: failed to persist tx hash", txHash, persistErr);

    // Best-effort: wait for one confirmation, but never fail the request if it takes too long.
    try {
      await Promise.race([confirm(), new Promise((resolve) => setTimeout(resolve, 20_000))]);
    } catch (confirmErr) {
      console.warn("anchor-event: confirmation wait failed", confirmErr);
    }

    return new Response(
      JSON.stringify({ anchored: true, tx_hash: txHash }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("anchor-event error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
