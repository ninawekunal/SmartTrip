import { ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import {
  createStopForActiveTrip,
  deleteStopForActiveTrip,
  listStopsForActiveTrip,
  reorderStopsForActiveTrip,
  updateStopForActiveTrip
} from "@/server/controllers/stops-controller";
import { createEndpointHandler } from "@/server/api-routes/utils/endpoint-wrapper";
import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

export const stopRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_LIST_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.STOPS_LIST_ACTIVE_TRIP, listStopsForActiveTrip)
  },
  {
    method: "POST",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_CREATE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.STOPS_CREATE_ACTIVE_TRIP, createStopForActiveTrip)
  },
  {
    method: "PATCH",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_UPDATE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.STOPS_UPDATE_ACTIVE_TRIP, updateStopForActiveTrip)
  },
  {
    method: "DELETE",
    path: "/api/stops/current-trip",
    options: { id: ROUTE_NAMES.STOPS_DELETE_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.STOPS_DELETE_ACTIVE_TRIP, deleteStopForActiveTrip)
  },
  {
    method: "POST",
    path: "/api/stops/current-trip/reorder",
    options: { id: ROUTE_NAMES.STOPS_REORDER_ACTIVE_TRIP, tags: ["api", "stops"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.STOPS_REORDER_ACTIVE_TRIP, reorderStopsForActiveTrip)
  }
];
