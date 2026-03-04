export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SmartTrip API",
    version: "0.1.0",
    description: "MVP API for trips, stops, reorder, and walking route metadata."
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      UserIdHeader: {
        type: "apiKey",
        in: "header",
        name: "x-user-id"
      }
    },
    schemas: {
      Trip: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          title: { type: "string" },
          city: { type: "string" },
          start_date: { type: "string", nullable: true },
          created_at: { type: "string" },
          updated_at: { type: "string" }
        }
      },
      Stop: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          trip_id: { type: "string", format: "uuid" },
          name: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          place_id: { type: "string", nullable: true },
          order_index: { type: "integer" },
          notes: { type: "string", nullable: true }
        }
      }
    }
  },
  security: [{ UserIdHeader: [] }],
  paths: {
    "/api/trips": {
      post: {
        summary: "Create trip",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "city"],
                properties: {
                  title: { type: "string" },
                  city: { type: "string" },
                  startDate: { type: "string", example: "2026-03-10" }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/api/trips/{id}": {
      get: {
        summary: "Get trip + ordered stops",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      patch: {
        summary: "Update trip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      delete: {
        summary: "Delete trip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/api/trips/{id}/stops": {
      post: {
        summary: "Add stop to trip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Created" } }
      }
    },
    "/api/stops/{id}": {
      patch: {
        summary: "Edit stop",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      delete: {
        summary: "Delete stop",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/api/trips/{id}/stops/reorder": {
      post: {
        summary: "Reorder all trip stops",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["stopIdsInOrder"],
                properties: {
                  stopIdsInOrder: {
                    type: "array",
                    items: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          }
        },
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/trips/{id}/route": {
      get: {
        summary: "Compute/get walking route metadata",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "mode", in: "query", required: true, schema: { type: "string", enum: ["walk"] } }
        ],
        responses: { "200": { description: "OK" } }
      }
    }
  }
} as const;
