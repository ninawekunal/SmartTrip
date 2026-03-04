import Boom from "@hapi/boom";
import { Request } from "@hapi/hapi";
import { createStopSchema, reorderStopsSchema, updateStopSchema } from "@/lib/api/schemas";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

function requireUserId(request: Request): string {
  const userId = request.app.context?.userId;
  if (!userId) {
    throw Boom.unauthorized("Missing x-user-id header.");
  }
  return userId;
}

function requireActiveTripId(request: Request): string {
  const tripId = request.app.context?.activeTripId;
  if (!tripId) {
    throw Boom.badRequest("Missing active trip id in cookie or x-active-trip-id header.");
  }
  return tripId;
}

async function assertActiveTripOwned(request: Request) {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  await supabaseDs.getTripByIdAndUser(tripId, userId);
  return tripId;
}

export async function listStopsForActiveTrip(request: Request) {
  const tripId = await assertActiveTripOwned(request);
  const stops = await supabaseDs.listStopsByTrip(tripId);
  return { stops };
}

export async function createStopForActiveTrip(request: Request) {
  const tripId = await assertActiveTripOwned(request);
  const payload = createStopSchema.parse(request.payload ?? {});

  const stop = await supabaseDs.createStop({
    tripId,
    name: payload.name,
    lat: payload.lat,
    lng: payload.lng,
    placeId: payload.placeId,
    notes: payload.notes
  });

  return { stop };
}

export async function updateStopForActiveTrip(request: Request) {
  const tripId = await assertActiveTripOwned(request);
  const payload = request.payload as { stopId?: string; name?: string; notes?: string | null };
  if (!payload?.stopId) {
    throw Boom.badRequest("stopId is required.");
  }

  const parsed = updateStopSchema.parse({ name: payload.name, notes: payload.notes });

  const stop = await supabaseDs.updateStopByTrip({
    tripId,
    stopId: payload.stopId,
    name: parsed.name,
    notes: parsed.notes
  });

  return { stop };
}

export async function deleteStopForActiveTrip(request: Request) {
  const tripId = await assertActiveTripOwned(request);
  const payload = request.payload as { stopId?: string };
  if (!payload?.stopId) {
    throw Boom.badRequest("stopId is required.");
  }

  await supabaseDs.deleteStopByTrip({ tripId, stopId: payload.stopId });
  return { deleted: true };
}

export async function reorderStopsForActiveTrip(request: Request) {
  const tripId = await assertActiveTripOwned(request);
  const payload = reorderStopsSchema.parse(request.payload ?? {});

  try {
    const stops = await supabaseDs.reorderStopsByTrip(tripId, payload.stopIdsInOrder);
    return { stops };
  } catch (error) {
    throw Boom.badRequest(error instanceof Error ? error.message : "Failed to reorder stops.");
  }
}
