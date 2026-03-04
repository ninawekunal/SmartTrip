import { getMapboxAccessToken } from "@/lib/env";
import {
  StopCoordinate,
  buildGoogleMapsWalkingUrl,
  fetchWalkingRoute
} from "@/lib/mapbox/directions";

export async function pingMapbox() {
  const token = getMapboxAccessToken();
  const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/rome.json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("access_token", token);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Mapbox ping failed: HTTP ${response.status}`);
  }

  return { ok: true };
}

export async function computeWalkingRoute(coordinates: StopCoordinate[]) {
  return fetchWalkingRoute(coordinates);
}

export function createGoogleMapsUrl(coordinates: StopCoordinate[]) {
  return buildGoogleMapsWalkingUrl(coordinates);
}
