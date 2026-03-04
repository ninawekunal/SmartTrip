import { ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import { getOpenApiDocument } from "@/server/controllers/openapi-controller";

export const openapiRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/api/openapi",
    options: { id: ROUTE_NAMES.OPENAPI_GET, tags: ["api", "docs"] },
    // OpenAPI must return raw document (not wrapped), so Swagger can consume it directly.
    handler: getOpenApiDocument
  }
];
