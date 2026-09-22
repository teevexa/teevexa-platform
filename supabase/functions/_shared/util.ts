// Shared helpers for Supabase edge functions (Deno runtime).
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export const escapeHtml = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escape text and turn blank-line separated blocks into <p> paragraphs. */
export const textToHtml = (v: string): string =>
  escapeHtml(v)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

export const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.teevexa.com";
export const ADMIN_INBOX = Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "teevexa@gmail.com";

export const adminClient = (): SupabaseClient =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

export interface EmailOpts {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}

/** Sends through Resend. Returns false (and logs) if not configured or on failure; never throws. */
export async function sendEmail(o: EmailOpts): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("RESEND_API_KEY not set; email skipped:", o.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: "Teevexa <no-reply@teevexa.com>",
        to: [o.to],
        subject: o.subject,
        html: o.html,
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
        ...(o.attachments ? { attachments: o.attachments } : {}),
      }),
    });
    if (!res.ok) {
      console.warn("Resend error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Resend request failed:", e);
    return false;
  }
}

export interface Caller {
  /** 'service' = called with the service-role key (function-to-function), 'user' = valid user JWT, 'anon' = neither */
  kind: "service" | "user" | "anon";
  userId?: string;
  roles: string[];
  isTeam: boolean;
}

const TEAM_ROLES = ["super_admin", "admin", "project_manager", "developer"];

export async function getCaller(req: Request, admin: SupabaseClient): Promise<Caller> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { kind: "anon", roles: [], isTeam: false };
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return { kind: "service", roles: [], isTeam: true };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { kind: "anon", roles: [], isTeam: false };
  const { data: rows } = await admin.from("user_roles").select("role").eq("user_id", data.user.id);
  const roles: string[] = ((rows ?? []) as { role: string }[]).map((r) => r.role);
  return { kind: "user", userId: data.user.id, roles, isTeam: roles.some((r) => TEAM_ROLES.includes(r)) };
}

export const sha256Hex = async (s: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const randomToken = (): string => {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}
