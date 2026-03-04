import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import { updateStopSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function assertStopOwnership(stopId: string, actorId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("stops")
    .select("id, trip_id, trips!inner(user_id)")
    .eq("id", stopId)
    .eq("trips.user_id", actorId)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  const { id: stopId } = await context.params;
  const ownedStop = await assertStopOwnership(stopId, actorId);
  if (!ownedStop) {
    return NextResponse.json({ error: "Stop not found." }, { status: 404 });
  }

  try {
    const payload = updateStopSchema.parse(await request.json());
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("stops")
      .update({
        name: payload.name,
        notes: payload.notes
      })
      .eq("id", stopId)
      .select("*")
      .single();

    if (error) {
      return internalError(error.message);
    }

    return NextResponse.json({ stop: data });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.message);
    }
    return internalError("Failed to update stop.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  const { id: stopId } = await context.params;
  const ownedStop = await assertStopOwnership(stopId, actorId);
  if (!ownedStop) {
    return NextResponse.json({ error: "Stop not found." }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("stops").delete().eq("id", stopId);
  if (error) {
    return internalError(error.message);
  }

  return NextResponse.json({ deleted: true });
}
