export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SmartTrip API",
    version: "0.2.0",
    description: "Hapi-based API for SmartTrip MVP."
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      UserIdHeader: {
        type: "apiKey",
        in: "header",
        name: "x-user-id"
      },
      ActiveTripHeader: {
        type: "apiKey",
        in: "header",
        name: "x-active-trip-id"
      }
    }
  },
  security: [{ UserIdHeader: [] }],
  paths: {
    "/api/trips": {
      get: { summary: "List trips for current user", responses: { "200": { description: "OK" } } },
      post: { summary: "Create trip", responses: { "200": { description: "OK" } } }
    },
    "/api/trips/select-active": {
      post: { summary: "Set active trip cookie", responses: { "200": { description: "OK" } } }
    },
    "/api/trips/current": {
      get: { summary: "Get active trip", responses: { "200": { description: "OK" } } },
      patch: { summary: "Update active trip", responses: { "200": { description: "OK" } } },
      delete: { summary: "Delete active trip", responses: { "200": { description: "OK" } } }
    },
    "/api/stops/current-trip": {
      get: { summary: "List stops for active trip", responses: { "200": { description: "OK" } } },
      post: { summary: "Create stop for active trip", responses: { "200": { description: "OK" } } },
      patch: { summary: "Update stop in active trip", responses: { "200": { description: "OK" } } },
      delete: { summary: "Delete stop in active trip", responses: { "200": { description: "OK" } } }
    },
    "/api/stops/current-trip/reorder": {
      post: { summary: "Reorder active trip stops", responses: { "200": { description: "OK" } } }
    },
    "/api/route/current-trip": {
      get: { summary: "Compute/get walking route for active trip", responses: { "200": { description: "OK" } } }
    },
    "/api/health/connections": {
      get: { summary: "Supabase + Mapbox health", responses: { "200": { description: "OK" } } }
    },
    "/graphql": {
      post: { summary: "GraphQL endpoint", responses: { "200": { description: "OK" } } }
    }
  }
} as const;
