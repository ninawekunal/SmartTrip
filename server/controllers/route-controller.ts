import Boom from "@hapi/boom";
import { Request } from "@hapi/hapi";
import { hashOrderedStops } from "@/lib/stops/hash";
import { requireActiveTripId, requireUserId } from "@/server/utils/request-context";
import * as mapboxDs from "@/server/data-sources/mapbox-data-source";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

export const computeRouteForActiveTrip = async (request: Request) => {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  await supabaseDs.getTripByIdAndUser(tripId, userId);

  const mode = (request.query as { mode?: string }).mode;
  if (mode !== "walk") {
    throw Boom.badRequest('Only "mode=walk" is supported for MVP.');
  }

  const stops = await supabaseDs.listStopsByTrip(tripId);
  const stopsHash = hashOrderedStops(stops as never);

  const cachedRoute = await supabaseDs.getRouteByTripModeAndHash({
    tripId,
    mode: "walking",
    stopsHash
  });

  const coordinates = stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }));
  const googleMapsUrl = mapboxDs.createGoogleMapsUrl(coordinates);

  if (cachedRoute) {
    return {
      route: cachedRoute,
      stopsHash,
      cached: true,
      googleMapsUrl
    };
  }

  const computed = await mapboxDs.computeWalkingRoute(coordinates);
  const route = await supabaseDs.upsertRoute({
    tripId,
    mode: "walking",
    provider: "mapbox",
    distanceM: computed.distanceM,
    durationS: computed.durationS,
    stopsHash
  });

  return {
    route,
    stopsHash,
    cached: false,
    googleMapsUrl
  };
};
