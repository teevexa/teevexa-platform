import { supabase } from "@/integrations/supabase/client";

export interface FnResult<T> {
  data: T | null;
  /** Human-readable message from the function's JSON body (or a generic fallback). */
  error: string | null;
  status: number | null;
}

/**
 * supabase.functions.invoke() returns `data: null` on any non-2xx response and hides the JSON body
 * inside error.context. This unwraps it so callers can show the function's real message (e.g. 409 slot taken).
 */
export async function invokeFn<T = Record<string, unknown>>(name: string, body: unknown): Promise<FnResult<T>> {
  const { data, error } = await supabase.functions.invoke(name, { body: body as Record<string, unknown> });
  if (!error) return { data: data as T, error: null, status: 200 };

  let message = "Something went wrong. Please try again.";
  let status: number | null = null;
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    status = ctx.status ?? null;
    try {
      const payload = await ctx.json();
      if (payload?.error && typeof payload.error === "string") message = payload.error;
    } catch {
      /* non-JSON body */
    }
  }
  return { data: null, error: message, status };
}
