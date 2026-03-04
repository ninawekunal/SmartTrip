import { ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import { computeRouteForActiveTrip } from "@/server/controllers/route-controller";
import { createEndpointHandler } from "@/server/api-routes/utils/endpoint-wrapper";
import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

export const routeRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/api/route/current-trip",
    options: { id: ROUTE_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP, tags: ["api", "route"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP, computeRouteForActiveTrip)
  }
];
