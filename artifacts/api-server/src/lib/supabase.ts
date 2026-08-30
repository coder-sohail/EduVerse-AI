import { createClient } from "@supabase/supabase-js";
import { ReplitConnectors } from "@replit/connectors-sdk";

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SupabaseProxyOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export function supabaseDatabaseRequest(
  path: string,
  options?: SupabaseProxyOptions,
): Promise<Response> {
  const connectors = new ReplitConnectors();
  const normalizedPath = path.replace(/^\/rest\/v1(?=\/|$)/, "") || "/";
  return connectors.proxy("supabase", normalizedPath, options);
}