import { ServerRoute } from "@hapi/hapi";
import { dispatchRoutes } from "@/server/api-routes/dispatch";
import { openapiRoutes } from "@/server/api-routes/openapi";
import { healthRoutes } from "@/server/api-routes/health";
import { tripRoutes } from "@/server/api-routes/trips";
import { stopRoutes } from "@/server/api-routes/stops";
import { routeRoutes } from "@/server/api-routes/route";

export const apiRoutes: ServerRoute[] = [
  ...dispatchRoutes,
  ...openapiRoutes,
  ...healthRoutes,
  ...tripRoutes,
  ...stopRoutes,
  ...routeRoutes
];
