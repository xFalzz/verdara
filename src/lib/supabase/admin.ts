import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase administrative client with Service Role privileges.
 * ONLY for use in secure Node.js server environments (Route Handlers, Server Actions).
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser client!
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase administrative credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
