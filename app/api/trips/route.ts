import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getActorId } from "@/lib/api/auth";
import { badRequest, internalError, unauthorized } from "@/lib/api/http";
import { createTripSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const actorId = getActorId(request);
  if (!actorId) {
    return unauthorized();
  }

  try {
    const payload = createTripSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: actorId,
        title: payload.title,
        city: payload.city,
        start_date: payload.startDate ?? null
      })
      .select("*")
      .single();

    if (error) {
      return internalError(error.message);
    }

    return NextResponse.json({ trip: data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.message);
    }
    return internalError("Failed to create trip.");
  }
}
