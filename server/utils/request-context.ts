import Boom from "@hapi/boom";
import { Request } from "@hapi/hapi";
import { RequestContext } from "@/shared/types/request-context";

export const getRequestContext = (request: Request): RequestContext => {
  return request.app.context ?? { userId: null, activeTripId: null, jwt: null };
};

export const requireUserId = (request: Request): string => {
  const userId = getRequestContext(request).userId;
  if (!userId) {
    throw Boom.unauthorized("Missing x-user-id header.");
  }
  return userId;
};

export const requireActiveTripId = (request: Request): string => {
  const activeTripId = getRequestContext(request).activeTripId;
  if (!activeTripId) {
    throw Boom.badRequest("Missing active trip id in cookie or x-active-trip-id header.");
  }
  return activeTripId;
};
