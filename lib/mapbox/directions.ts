import { getMapboxAccessToken } from "@/lib/env";

export type StopCoordinate = {
  lat: number;
  lng: number;
};

export type RouteSummary = {
  distanceM: number;
  durationS: number;
};

export async function fetchWalkingRoute(
  coordinates: StopCoordinate[]
): Promise<RouteSummary> {
  if (coordinates.length < 2) {
    return { distanceM: 0, durationS: 0 };
  }

  const path = coordinates.map((coord) => `${coord.lng},${coord.lat}`).join(";");
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/walking/${path}`);
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "simplified");
  url.searchParams.set("access_token", getMapboxAccessToken());

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Mapbox request failed with ${response.status}`);
  }

  const body = (await response.json()) as {
    routes?: Array<{ distance: number; duration: number }>;
  };

  const firstRoute = body.routes?.[0];
  if (!firstRoute) {
    throw new Error("Mapbox returned no route");
  }

  return {
    distanceM: Math.round(firstRoute.distance),
    durationS: Math.round(firstRoute.duration)
  };
}

export function buildGoogleMapsWalkingUrl(coordinates: StopCoordinate[]): string {
  if (coordinates.length === 0) {
    return "https://www.google.com/maps";
  }

  const origin = `${coordinates[0].lat},${coordinates[0].lng}`;
  const destination =
    coordinates.length > 1
      ? `${coordinates[coordinates.length - 1].lat},${coordinates[coordinates.length - 1].lng}`
      : origin;
  const waypoints = coordinates
    .slice(1, -1)
    .map((coord) => `${coord.lat},${coord.lng}`)
    .join("|");

  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("travelmode", "walking");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints) {
    url.searchParams.set("waypoints", waypoints);
  }
  return url.toString();
}
