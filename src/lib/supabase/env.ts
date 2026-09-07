/**
 * Normalize common paste mistakes like:
 * https://xxx.supabase.co/rest/v1/
 * into:
 * https://xxx.supabase.co
 */
export function getSupabaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  if (!raw) return "";
  return raw
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function hasSupabaseEnv() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  return Boolean(url && anon);
}
