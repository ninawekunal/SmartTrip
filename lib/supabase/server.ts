import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import { Database } from "@/lib/supabase/types";

export function createServiceClient() {
  console.log("env: ");
  const env = getEnv();

  

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: true, autoRefreshToken: true }
    }
  );
}
