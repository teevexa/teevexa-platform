import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller's JWT using the anon client
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Admin client — required for privileged deletes and auth.admin.deleteUser
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Anonymize trace_events attributed to this user.
    //    We never hard-delete events because blockchain-anchored records are permanent
    //    and removing the DB row would break the supply chain timeline for clients.
    await admin
      .from("trace_events")
      .update({ recorder: null })
      .eq("recorder", userId);

    // 2. Delete this user's notifications
    await admin
      .from("trace_notifications")
      .delete()
      .eq("user_id", userId);

    // 3. Delete role assignment
    await admin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // 4. Delete profile row (uses user_id column, not id)
    await admin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    // 5. Best-effort storage cleanup — delete files in the user's folder
    for (const bucket of ["trace-photos", "trace-audio"]) {
      const { data: files } = await admin.storage.from(bucket).list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
        await admin.storage.from(bucket).remove(paths);
      }
    }

    // 6. Delete the auth user — must be last
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[delete-account] auth.admin.deleteUser failed:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete account. Please contact support@teevexa.com." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[delete-account] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
