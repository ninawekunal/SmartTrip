import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import { createStopSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  try {
    const payload = createStopSchema.parse(await request.json());
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

    const { data: lastStop, error: lastStopError } = await supabase
      .from("stops")
      .select("order_index")
      .eq("trip_id", tripId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastStopError) {
      return internalError(lastStopError.message);
    }

    const nextOrderIndex = (lastStop?.order_index ?? -1) + 1;
    const { data, error } = await supabase
      .from("stops")
      .insert({
        trip_id: tripId,
        name: payload.name,
        lat: payload.lat,
        lng: payload.lng,
        place_id: payload.placeId ?? null,
        notes: payload.notes ?? null,
        order_index: nextOrderIndex
      })
      .select("*")
      .single();

    if (error) {
      return internalError(error.message);
    }

    return NextResponse.json({ stop: data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.message);
    }
    return internalError("Failed to add stop.");
  }
}
