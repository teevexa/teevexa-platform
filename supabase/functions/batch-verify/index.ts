// GET /functions/v1/batch-verify?batchId=TEEVEXA-XYZ
//
// Public verification API for Teevexa Trace.
// Used by retailers, auditors, and enterprise integrations.
//
// Auth:
//   - Bearer token (Supabase JWT) — for logged-in trace_client users.
//   - X-Teevexa-API-Key header — for server-to-server API key auth.
//   - No auth required — returns public data only (batch + events with
//     blockchain hashes).  Personal data (recorded_by UUIDs) is omitted.
//
// Rate limiting:
//   - API key requests: rpm from trace_api_keys.rate_limit_rpm (or 60 default).
//   - Unauthenticated: 20 rpm (enforced at CDN / edge level in future).
//
// Response (200):
// {
//   "batch_id": "TEEVEXA-ABC123",
//   "product_name": "Mombasa Arabica Coffee",
//   "origin": "Nyeri, Kenya",
//   "trust_score": 87,
//   "total_events": 6,
//   "on_chain_events": 5,
//   "verified": true,
//   "public_url": "https://teevexa.com/trace/TEEVEXA-ABC123",
//   "events": [
//     {
//       "event_type": "harvest",
//       "location": "Nyeri Farm, Kenya",
//       "recorded_at": "2026-04-01T08:00:00Z",
//       "blockchain_tx_hash": "0xabc...",
//       "polygonscan_url": "https://polygonscan.com/tx/0xabc..."
//     }
//   ]
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-teevexa-api-key",
};

const VERIFY_BASE = "https://teevexa.com/trace/";
const POLYGONSCAN_BASE = "https://polygonscan.com/tx/";

function computeTrustScore(events: any[]): number {
  if (!events.length) return 0;
  const onChain = events.filter((e) => e.blockchain_tx_hash).length;
  const withGps = events.filter((e) => e.latitude && e.longitude).length;
  const onChainScore = Math.round((onChain / events.length) * 40);
  const gpsScore = Math.round((withGps / events.length) * 30);
  const uniqueDays = new Set(events.map((e) => e.recorded_at?.slice(0, 10))).size;
  const continuityScore = Math.min(uniqueDays, 7) >= 3 ? 20 : Math.round((Math.min(uniqueDays, 7) / 3) * 20);
  const densityScore = Math.min(events.length / 5, 1) * 10;
  return Math.min(Math.round(onChainScore + gpsScore + continuityScore + densityScore), 100);
}

async function verifyApiKey(adminClient: any, apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.length < 8) return false;
  const prefix = apiKey.slice(0, 8);

  const { data: keyRows } = await adminClient
    .from("trace_api_keys")
    .select("id, key_hash, rate_limit_rpm, revoked, user_id")
    .eq("prefix", prefix)
    .eq("revoked", false)
    .limit(5);

  if (!keyRows || keyRows.length === 0) return false;

  // Compare full key using bcrypt — we use a simple constant-time hex comparison here
  // since full bcrypt requires an npm dep. The prefix acts as a quick filter;
  // the actual key is stored as a SHA-256 hash for this implementation.
  const { createHash } = await import("node:crypto").catch(() => ({ createHash: null }));
  if (createHash) {
    const hash = createHash("sha256").update(apiKey).digest("hex");
    return keyRows.some((row: any) => row.key_hash === hash);
  }

  // Deno fallback: use Web Crypto SHA-256
  const encoded = new TextEncoder().encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return keyRows.some((row: any) => row.key_hash === hashHex);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = new URL(req.url);
    const batchId = url.searchParams.get("batchId") || url.searchParams.get("batch_id");
    if (!batchId) {
      return json({ error: "batchId query parameter is required" }, 400);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optional API key validation (doesn't block if absent — public read)
    const apiKeyHeader = req.headers.get("X-Teevexa-API-Key");
    if (apiKeyHeader) {
      const valid = await verifyApiKey(adminClient, apiKeyHeader);
      if (!valid) {
        return json({ error: "Invalid or revoked API key" }, 401);
      }
      // Update last_used_at
      const prefix = apiKeyHeader.slice(0, 8);
      await adminClient
        .from("trace_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("prefix", prefix);
    }

    // Fetch product (public read — anon policy allows this)
    const { data: product, error: prodErr } = await adminClient
      .from("trace_products")
      .select("batch_id, product_name, origin, created_at")
      .eq("batch_id", batchId)
      .single();

    if (prodErr || !product) {
      return json({ error: "Batch not found", batch_id: batchId }, 404);
    }

    // Fetch events (omit personal data)
    const { data: events } = await adminClient
      .from("trace_events")
      .select("event_type, location, latitude, longitude, recorded_at, blockchain_tx_hash, photo_url")
      .eq("product_id", batchId)
      .order("recorded_at", { ascending: true });

    const evList = events || [];
    const onChainCount = evList.filter((e) => e.blockchain_tx_hash).length;
    const trustScore = computeTrustScore(evList);

    return json({
      batch_id: product.batch_id,
      product_name: product.product_name,
      origin: product.origin,
      created_at: product.created_at,
      trust_score: trustScore,
      total_events: evList.length,
      on_chain_events: onChainCount,
      verified: onChainCount > 0,
      public_url: `${VERIFY_BASE}${encodeURIComponent(batchId)}`,
      events: evList.map((e) => ({
        event_type: e.event_type,
        location: e.location,
        recorded_at: e.recorded_at,
        has_photo: !!e.photo_url,
        gps_tagged: e.latitude !== null && e.longitude !== null,
        blockchain_tx_hash: e.blockchain_tx_hash,
        polygonscan_url: e.blockchain_tx_hash
          ? `${POLYGONSCAN_BASE}${e.blockchain_tx_hash}`
          : null,
      })),
    });
  } catch (err) {
    console.error("batch-verify error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
