import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
