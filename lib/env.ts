import { z } from "zod";

const baseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().min(1)
});

const mapboxEnvSchema = z.object({
  MAPBOX_ACCESS_TOKEN: z.string().min(1)
});

export type Env = z.infer<typeof baseEnvSchema>;

let cachedEnv: Env | null = null;
let cachedMapboxToken: string | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = baseEnvSchema.parse(process.env);
  return cachedEnv;
}

export function getMapboxAccessToken(): string {
  if (cachedMapboxToken) {
    return cachedMapboxToken;
  }
  cachedMapboxToken = mapboxEnvSchema.parse(process.env).MAPBOX_ACCESS_TOKEN;
  return cachedMapboxToken;
}
