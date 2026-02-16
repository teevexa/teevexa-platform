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
    const { type, data } = await req.json();

    // Log to console for now — replace with email service later
    console.log(`[ADMIN NOTIFICATION] Type: ${type}`);
    console.log(`[ADMIN NOTIFICATION] Data:`, JSON.stringify(data, null, 2));

    // Future: integrate with Resend, SendGrid, or SMTP for email
    // Future: trigger CRM webhook here

    return new Response(
      JSON.stringify({ success: true, message: `Admin notified about ${type}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Notification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});