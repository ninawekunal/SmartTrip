import Boom from "@hapi/boom";
import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import { endpointHandlerMap } from "@/server/handlers/endpoint-handler-map";
import { EndpointName, ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";
import { getGlobalConfig } from "@/shared/config/load-global-config";

type Handler = (request: Request, h: ResponseToolkit) => unknown | Promise<unknown>;

function enforceAccess(request: Request, endpointName: EndpointName) {
  const config = getGlobalConfig();
  const level = config.endpointSecurity[endpointName] ?? "none";

  if ((level === "user" || level === "user+activeTrip") && !request.app.context?.userId) {
    throw Boom.unauthorized("Missing x-user-id header.");
  }

  if (level === "user+activeTrip" && !request.app.context?.activeTripId) {
    throw Boom.badRequest("Missing active trip id in cookie or x-active-trip-id header.");
  }
}

function withEndpoint(endpointName: EndpointName): Handler {
  const handler = endpointHandlerMap[endpointName] as Handler | undefined;
  if (!handler) {
    throw new Error(`Missing handler for endpoint ${endpointName}`);
  }

  return async (request, h) => {
    enforceAccess(request, endpointName);
    return handler(request, h);
  };
}

async function dispatchByName(request: Request, h: ResponseToolkit) {
  const endpointName = request.params.endpointName as EndpointName;
  const handler = withEndpoint(endpointName);
  const result = await handler(request, h);
  return h.response({ endpointName, result }).code(200);
}

export const apiRoutes: ServerRoute[] = [
  {
    method: "POST",
    path: "/api/dispatch/{endpointName}",
    options: { id: ROUTE_NAMES.API_DISPATCH, tags: ["api", "dispatch"] },
    handler: dispatchByName
  },

  {
    method: "GET",
    path: "/api/openapi",
    options: { id: ROUTE_NAMES.OPENAPI_GET, tags: ["api", "docs"] },
    handler: withEndpoint(ENDPOINT_NAMES.OPENAPI_GET)
  },
  {
    method: "GET",
    path: "/api/health/connections",
    options: { id: ROUTE_NAMES.HEALTH_CONNECTIONS, tags: ["api", "health"] },
    handler: withEndpoint(ENDPOINT_NAMES.HEALTH_CONNECTIONS)
  },

  {
    method: "GET",
    path: "/api/trips",
    options: { id: ROUTE_NAMES.TRIPS_LIST, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_LIST)
  },
  {
    method: "POST",
    path: "/api/trips",
    options: { id: ROUTE_NAMES.TRIPS_CREATE, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_CREATE)
  },
  {
    method: "POST",
    path: "/api/trips/select-active",
    options: { id: ROUTE_NAMES.TRIPS_SELECT_ACTIVE, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_SELECT_ACTIVE)
  },
  {
    method: "GET",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_GET_ACTIVE, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_GET_ACTIVE)
  },
  {
    method: "PATCH",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_UPDATE_ACTIVE, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_UPDATE_ACTIVE)
  },
  {
    method: "DELETE",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_DELETE_ACTIVE, tags: ["api", "trips"] },
    handler: withEndpoint(ENDPOINT_NAMES.TRIPS_DELETE_ACTIVE)
  },

  {
    method: "GET",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_LIST_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: withEndpoint(ENDPOINT_NAMES.STOPS_LIST_ACTIVE_TRIP)
  },
  {
    method: "POST",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_CREATE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: withEndpoint(ENDPOINT_NAMES.STOPS_CREATE_ACTIVE_TRIP)
  },
  {
    method: "PATCH",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_UPDATE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: withEndpoint(ENDPOINT_NAMES.STOPS_UPDATE_ACTIVE_TRIP)
  },
  {
    method: "DELETE",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_DELETE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: withEndpoint(ENDPOINT_NAMES.STOPS_DELETE_ACTIVE_TRIP)
  },
  {
    method: "POST",
    path: "/api/stops/current-trip/reorder",
    options: { id: ROUTE_NAMES.STOPS_REORDER_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: withEndpoint(ENDPOINT_NAMES.STOPS_REORDER_ACTIVE_TRIP)
  },

  {
    method: "GET",
    path: "/api/route/current-trip",
    options: { id: ROUTE_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP, tags: ["api", "route"] },
    handler: withEndpoint(ENDPOINT_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP)
  }
];
