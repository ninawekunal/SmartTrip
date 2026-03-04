import { ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import {
  createTrip,
  deleteActiveTrip,
  getActiveTrip,
  listTrips,
  selectActiveTrip,
  updateActiveTrip
} from "@/server/controllers/trips-controller";
import { createEndpointHandler } from "@/server/api-routes/utils/endpoint-wrapper";
import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

export const tripRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/api/trips",
    options: { id: ROUTE_NAMES.TRIPS_LIST, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_LIST, listTrips)
  },
  {
    method: "POST",
    path: "/api/trips",
    options: { id: ROUTE_NAMES.TRIPS_CREATE, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_CREATE, createTrip)
  },
  {
    method: "POST",
    path: "/api/trips/select-active",
    options: { id: ROUTE_NAMES.TRIPS_SELECT_ACTIVE, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_SELECT_ACTIVE, selectActiveTrip)
  },
  {
    method: "GET",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_GET_ACTIVE, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_GET_ACTIVE, getActiveTrip)
  },
  {
    method: "PATCH",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_UPDATE_ACTIVE, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_UPDATE_ACTIVE, updateActiveTrip)
  },
  {
    method: "DELETE",
    path: "/api/trips/current",
    options: { id: ROUTE_NAMES.TRIPS_DELETE_ACTIVE, tags: ["api", "trips"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.TRIPS_DELETE_ACTIVE, deleteActiveTrip)
  }
];
