export const ENDPOINT_NAMES = {
  OPENAPI_GET: "openapi.get",
  HEALTH_CONNECTIONS: "health.connections",

  TRIPS_LIST: "trips.list",
  TRIPS_CREATE: "trips.create",
  TRIPS_SELECT_ACTIVE: "trips.selectActive",
  TRIPS_GET_ACTIVE: "trips.getActive",
  TRIPS_UPDATE_ACTIVE: "trips.updateActive",
  TRIPS_DELETE_ACTIVE: "trips.deleteActive",

  STOPS_LIST_ACTIVE_TRIP: "stops.listForActiveTrip",
  STOPS_CREATE_ACTIVE_TRIP: "stops.createForActiveTrip",
  STOPS_UPDATE_ACTIVE_TRIP: "stops.updateForActiveTrip",
  STOPS_DELETE_ACTIVE_TRIP: "stops.deleteForActiveTrip",
  STOPS_REORDER_ACTIVE_TRIP: "stops.reorderForActiveTrip",

  ROUTE_COMPUTE_ACTIVE_TRIP: "route.computeForActiveTrip"
} as const;

export type EndpointName = (typeof ENDPOINT_NAMES)[keyof typeof ENDPOINT_NAMES];
