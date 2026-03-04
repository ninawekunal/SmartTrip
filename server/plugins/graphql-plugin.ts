import { Plugin } from "@hapi/hapi";
import { executeGraphqlQuery } from "@/server/graphql/schema";

export const graphqlPlugin: Plugin<undefined> = {
  name: "graphql-plugin",
  register: async (server) => {
    server.route({
      method: "POST",
      path: "/graphql",
      handler: async (request, h) => {
        const payload = (request.payload ?? {}) as {
          query?: string;
          variables?: Record<string, unknown>;
        };

        if (!payload.query) {
          return h.response({ error: "GraphQL query is required." }).code(400);
        }

        const result = await executeGraphqlQuery({
          source: payload.query,
          variableValues: payload.variables,
          contextValue: request
        });

        return h.response(result).code(200);
      }
    });
  }
};
