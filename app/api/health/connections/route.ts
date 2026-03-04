import { NextResponse } from "next/server";
import { getMapboxAccessToken } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

type ServiceStatus = {
  connected: boolean;
  message: string;
};

type ConnectionsResponse = {
  supabase: ServiceStatus;
  mapbox: ServiceStatus;
};

async function checkSupabase(): Promise<ServiceStatus> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("trips").select("id").limit(1);

    if (error) {
      return {
        connected: false,
        message: `Supabase query failed: ${error.message}`
      };
    }

    return {
      connected: true,
      message: "Connected and query succeeded."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      connected: false,
      message: `Supabase check failed: ${message}`
    };
  }
}

async function checkMapbox(): Promise<ServiceStatus> {
  try {
    const token = getMapboxAccessToken();
    const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/rome.json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("access_token", token);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return {
        connected: false,
        message: `Mapbox request failed: HTTP ${response.status}`
      };
    }

    return {
      connected: true,
      message: "Connected and request succeeded."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      connected: false,
      message: `Mapbox check failed: ${message}`
    };
  }
}

export async function GET() {
  const [supabase, mapbox] = await Promise.all([checkSupabase(), checkMapbox()]);
  const payload: ConnectionsResponse = { supabase, mapbox };

  const isHealthy = supabase.connected && mapbox.connected;
  return NextResponse.json(payload, { status: isHealthy ? 200 : 503 });
}
