import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import { updateTripSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  const { id } = await context.params;
  const supabase = createServiceClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", actorId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: stops, error: stopsError } = await supabase
    .from("stops")
    .select("*")
    .eq("trip_id", id)
    .order("order_index", { ascending: true });
  if (stopsError) {
    return internalError(stopsError.message);
  }

  return NextResponse.json({ trip: { ...trip, stops } });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  try {
    const payload = updateTripSchema.parse(await request.json());
    const { id } = await context.params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("trips")
      .update({
        title: payload.title,
        city: payload.city,
        start_date: payload.startDate
      })
      .eq("id", id)
      .eq("user_id", actorId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ trip: data });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.message);
    }
    return internalError("Failed to update trip.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  const { id } = await context.params;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("user_id", actorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
