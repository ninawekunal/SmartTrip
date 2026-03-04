import { NextRequest, NextResponse } from "next/server";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import {
  buildGoogleMapsWalkingUrl,
  fetchWalkingRoute
} from "@/lib/mapbox/directions";
import { hashOrderedStops } from "@/lib/stops/hash";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  const mode = request.nextUrl.searchParams.get("mode");
  if (mode !== "walk") {
    return badRequest('Only "mode=walk" is supported for MVP.');
  }

  const { id: tripId } = await context.params;
  const supabase = createServiceClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", actorId)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const { data: stops, error: stopsError } = await supabase
    .from("stops")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true });

  if (stopsError) {
    return internalError(stopsError.message);
  }

  const stopsHash = hashOrderedStops(stops ?? []);
  const { data: cachedRoute } = await supabase
    .from("routes")
    .select("*")
    .eq("trip_id", tripId)
    .eq("mode", "walking")
    .eq("stops_hash", stopsHash)
    .maybeSingle();

  const coordinates = (stops ?? []).map((stop) => ({
    lat: stop.lat,
    lng: stop.lng
  }));
  const googleMapsUrl = buildGoogleMapsWalkingUrl(coordinates);

  if (cachedRoute) {
    return NextResponse.json({
      route: cachedRoute,
      stopsHash,
      cached: true,
      googleMapsUrl
    });
  }

  try {
    const computed = await fetchWalkingRoute(coordinates);

    const { data: route, error: upsertError } = await supabase
      .from("routes")
      .upsert(
        {
          trip_id: tripId,
          mode: "walking",
          provider: "mapbox",
          distance_m: computed.distanceM,
          duration_s: computed.durationS,
          stops_hash: stopsHash,
          computed_at: new Date().toISOString()
        },
        { onConflict: "trip_id,mode,stops_hash" }
      )
      .select("*")
      .single();

    if (upsertError) {
      return internalError(upsertError.message);
    }

    return NextResponse.json({
      route,
      stopsHash,
      cached: false,
      googleMapsUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Route compute failed.";
    return internalError(message);
  }
}
