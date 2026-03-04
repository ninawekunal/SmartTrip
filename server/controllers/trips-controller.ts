import Boom from "@hapi/boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { createTripSchema, updateTripSchema } from "@/lib/api/schemas";
import { getGlobalConfig } from "@/shared/config/load-global-config";
import { requireActiveTripId, requireUserId } from "@/server/utils/request-context";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

export const listTrips = async (request: Request) => {
  const userId = requireUserId(request);
  const trips = await supabaseDs.listTripsByUser(userId);
  return { trips };
};

export const createTrip = async (request: Request) => {
  const userId = requireUserId(request);
  const payload = createTripSchema.parse(request.payload ?? {});

  const trip = await supabaseDs.createTrip({
    userId,
    title: payload.title,
    city: payload.city,
    startDate: payload.startDate ?? null
  });

  return { trip };
};

export const selectActiveTrip = async (request: Request, h: ResponseToolkit) => {
  const userId = requireUserId(request);
  const payload = request.payload as { tripId?: string };

  if (!payload?.tripId) {
    throw Boom.badRequest("tripId is required.");
  }

  await supabaseDs.getTripByIdAndUser(payload.tripId, userId);

  const config = getGlobalConfig();
  return h
    .response({ activeTripId: payload.tripId })
    .state(config.auth.activeTripCookieName, payload.tripId, {
      isHttpOnly: true,
      isSecure: false,
      isSameSite: "Lax",
      path: "/"
    });
};

export const getActiveTrip = async (request: Request) => {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  const trip = await supabaseDs.getTripByIdAndUser(tripId, userId);
  const stops = await supabaseDs.listStopsByTrip(tripId);
  return { trip: { ...trip, stops } };
};

export const updateActiveTrip = async (request: Request) => {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  const payload = updateTripSchema.parse(request.payload ?? {});

  const trip = await supabaseDs.updateTripByIdAndUser({
    tripId,
    userId,
    title: payload.title,
    city: payload.city,
    startDate: payload.startDate
  });

  return { trip };
};

export const deleteActiveTrip = async (request: Request, h: ResponseToolkit) => {
  const userId = requireUserId(request);
  const tripId = requireActiveTripId(request);
  await supabaseDs.deleteTripByIdAndUser(tripId, userId);

  const config = getGlobalConfig();
  return h.response({ deleted: true }).unstate(config.auth.activeTripCookieName, { path: "/" });
};
