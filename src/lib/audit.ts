import { supabase } from "@/integrations/supabase/client";

interface AuditPayload {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}

export const logAudit = async (payload: AuditPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert([{
      actor_id: user.id,
      action: payload.action,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id || null,
      details: (payload.details || null) as import("@/integrations/supabase/types").Json,
    }]);
  } catch (e) {
    console.error("Audit log failed:", e);
  }
};
