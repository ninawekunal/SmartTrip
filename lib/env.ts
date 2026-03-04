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

const formatZodError = (error: z.ZodError) => {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
};

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = baseEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Environment validation failed for base env: ${formatZodError(error)}`);
    }
    throw error;
  }
  return cachedEnv;
}

export function getMapboxAccessToken(): string {
  if (cachedMapboxToken) {
    return cachedMapboxToken;
  }
  try {
    cachedMapboxToken = mapboxEnvSchema.parse(process.env).MAPBOX_ACCESS_TOKEN;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Environment validation failed for mapbox env: ${formatZodError(error)}`);
    }
    throw error;
  }
  return cachedMapboxToken;
}
