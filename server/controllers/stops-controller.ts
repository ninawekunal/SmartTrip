import Boom from "@hapi/boom";
import { Request } from "@hapi/hapi";
import { createStopSchema, reorderStopsSchema, updateStopSchema } from "@/lib/api/schemas";
import { requireActiveTripId, requireUserId } from "@/server/utils/request-context";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

const assertActiveTripOwned = async (request: Request) => {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  await supabaseDs.getTripByIdAndUser(tripId, userId);
  return tripId;
};

export const listStopsForActiveTrip = async (request: Request) => {
  const tripId = await assertActiveTripOwned(request);
  const stops = await supabaseDs.listStopsByTrip(tripId);
  return { stops };
};

export const createStopForActiveTrip = async (request: Request) => {
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
};

export const updateStopForActiveTrip = async (request: Request) => {
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
};

export const deleteStopForActiveTrip = async (request: Request) => {
  const tripId = await assertActiveTripOwned(request);
  const payload = request.payload as { stopId?: string };
  if (!payload?.stopId) {
    throw Boom.badRequest("stopId is required.");
  }

  await supabaseDs.deleteStopByTrip({ tripId, stopId: payload.stopId });
  return { deleted: true };
};

export const reorderStopsForActiveTrip = async (request: Request) => {
  const tripId = await assertActiveTripOwned(request);
  const payload = reorderStopsSchema.parse(request.payload ?? {});

  try {
    const stops = await supabaseDs.reorderStopsByTrip(tripId, payload.stopIdsInOrder);
    return { stops };
  } catch (error) {
    throw Boom.badRequest(error instanceof Error ? error.message : "Failed to reorder stops.");
  }
};
