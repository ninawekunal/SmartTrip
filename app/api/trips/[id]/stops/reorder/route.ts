import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import { reorderStopsSchema } from "@/lib/api/schemas";
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
    const payload = reorderStopsSchema.parse(await request.json());
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

    const { data: currentStops, error: currentStopsError } = await supabase
      .from("stops")
      .select("id")
      .eq("trip_id", tripId);

    if (currentStopsError) {
      return internalError(currentStopsError.message);
    }

    const currentIds = new Set((currentStops ?? []).map((stop) => stop.id));
    const incomingIds = payload.stopIdsInOrder;
    const hasSameCount = currentIds.size === incomingIds.length;
    const isSubset = incomingIds.every((id) => currentIds.has(id));
    if (!hasSameCount || !isSubset) {
      return badRequest("stopIdsInOrder must include each trip stop exactly once.");
    }

    // Two-phase update avoids unique constraint collisions when swapping indices.
    for (const [tempIndex, stopId] of Array.from(currentIds).entries()) {
      const { error: shiftError } = await supabase
        .from("stops")
        .update({ order_index: 100000 + tempIndex })
        .eq("id", stopId)
        .eq("trip_id", tripId);
      if (shiftError) {
        return internalError(shiftError.message);
      }
    }

    for (const [index, stopId] of incomingIds.entries()) {
      const { error: updateError } = await supabase
        .from("stops")
        .update({ order_index: index })
        .eq("id", stopId)
        .eq("trip_id", tripId);
      if (updateError) {
        return internalError(updateError.message);
      }
    }

    const { data: stops, error: fetchError } = await supabase
      .from("stops")
      .select("*")
      .eq("trip_id", tripId)
      .order("order_index", { ascending: true });

    if (fetchError) {
      return internalError(fetchError.message);
    }

    return NextResponse.json({ stops });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.message);
    }
    return internalError("Failed to reorder stops.");
  }
}
