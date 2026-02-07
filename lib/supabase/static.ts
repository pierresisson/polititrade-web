import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for cacheable, public queries.
 * Uses the anon key — safe for data with no RLS user-filtering.
 * Singleton (module-level) so it's reused across requests.
 */
export const supabaseStatic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
