import { ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import { connectionsHealth } from "@/server/controllers/health-controller";
import { createEndpointHandler } from "@/server/api-routes/utils/endpoint-wrapper";
import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

export const healthRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/api/health/connections",
    options: { id: ROUTE_NAMES.HEALTH_CONNECTIONS, tags: ["api", "health"] },
    handler: createEndpointHandler(ENDPOINT_NAMES.HEALTH_CONNECTIONS, connectionsHealth)
  }
];
