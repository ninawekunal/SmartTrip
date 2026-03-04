import * as mapboxDs from "@/server/data-sources/mapbox-data-source";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

export async function connectionsHealth(request: { app: { context?: { userId: string | null } } }) {
  const userId = request.app.context?.userId ?? "00000000-0000-0000-0000-000000000000";
  const status = {
    supabase: { connected: true, message: "Connected" },
    mapbox: { connected: true, message: "Connected" }
  };

  try {
    await supabaseDs.listTripsByUser(userId);
  } catch (error) {
    status.supabase = {
      connected: false,
      message: error instanceof Error ? error.message : "Supabase check failed."
    };
  }

  try {
    await mapboxDs.pingMapbox();
  } catch (error) {
    status.mapbox = {
      connected: false,
      message: error instanceof Error ? error.message : "Mapbox check failed."
    };
  }

  return status;
}
