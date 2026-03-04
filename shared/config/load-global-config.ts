import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseJsonc } from "@/shared/utils/jsonc";
import { EndpointName } from "@/shared/constants/endpoint-names";

export type SecurityLevel = "none" | "user" | "user+activeTrip";

export type GlobalConfig = {
  appName: string;
  environment: string;
  features: {
    enableNextFrontend: boolean;
    enableHapiServer: boolean;
    enableGraphQL: boolean;
    enableSwagger: boolean;
    enableMobxStore: boolean;
    useCookieBasedActiveTrip: boolean;
  };
  server: {
    host: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[];
  };
  auth: {
    jwtCookieName: string;
    activeTripCookieName: string;
    jwtHeaderName: string;
  };
  endpointSecurity: Partial<Record<EndpointName, SecurityLevel>>;
  downstream: {
    supabase: {
      baseUrlEnvKey: string;
    };
    mapbox: {
      directionsBaseUrl: string;
      geocodingBaseUrl: string;
    };
  };
  webpack: {
    client: {
      entry: string;
      outputDir: string;
      outputFile: string;
    };
  };
};

let cached: GlobalConfig | null = null;

export function getGlobalConfig(): GlobalConfig {
  if (cached) {
    return cached;
  }

  const path = resolve(process.cwd(), "config/global.config.jsonc");
  const raw = readFileSync(path, "utf8");
  cached = parseJsonc(raw) as GlobalConfig;
  return cached;
}
