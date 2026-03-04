import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";
import {
  healthController,
  openapiController,
  routeController,
  stopsController,
  tripsController
} from "@/server/controllers";

export const endpointHandlerMap = {
  [ENDPOINT_NAMES.OPENAPI_GET]: openapiController.getOpenApiDocument,
  [ENDPOINT_NAMES.HEALTH_CONNECTIONS]: healthController.connectionsHealth,

  [ENDPOINT_NAMES.TRIPS_LIST]: tripsController.listTrips,
  [ENDPOINT_NAMES.TRIPS_CREATE]: tripsController.createTrip,
  [ENDPOINT_NAMES.TRIPS_SELECT_ACTIVE]: tripsController.selectActiveTrip,
  [ENDPOINT_NAMES.TRIPS_GET_ACTIVE]: tripsController.getActiveTrip,
  [ENDPOINT_NAMES.TRIPS_UPDATE_ACTIVE]: tripsController.updateActiveTrip,
  [ENDPOINT_NAMES.TRIPS_DELETE_ACTIVE]: tripsController.deleteActiveTrip,

  [ENDPOINT_NAMES.STOPS_LIST_ACTIVE_TRIP]: stopsController.listStopsForActiveTrip,
  [ENDPOINT_NAMES.STOPS_CREATE_ACTIVE_TRIP]: stopsController.createStopForActiveTrip,
  [ENDPOINT_NAMES.STOPS_UPDATE_ACTIVE_TRIP]: stopsController.updateStopForActiveTrip,
  [ENDPOINT_NAMES.STOPS_DELETE_ACTIVE_TRIP]: stopsController.deleteStopForActiveTrip,
  [ENDPOINT_NAMES.STOPS_REORDER_ACTIVE_TRIP]: stopsController.reorderStopsForActiveTrip,

  [ENDPOINT_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP]: routeController.computeRouteForActiveTrip
} as const;
