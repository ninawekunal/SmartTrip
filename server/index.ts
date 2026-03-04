import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { apiRoutes } from "@/server/api-routes/routes";
import { getGlobalConfig } from "@/shared/config/load-global-config";
import { graphqlPlugin } from "@/server/plugins/graphql-plugin";
import { requestContextPlugin } from "@/server/plugins/request-context-plugin";
import { getEnv } from "@/lib/env";

const loadEnvFiles = () => {
  dotenv.config({ path: ".env.local", override: false });
  dotenv.config({ path: ".env", override: false });
};

async function bootstrap() {
  loadEnvFiles();
  getEnv();

  const config = getGlobalConfig();
  const server = Hapi.server({
    host: config.server.host,
    port: config.server.port,
    routes: {
      cors: {
        origin: config.server.corsOrigins
      }
    }
  });

  await server.register(requestContextPlugin);

  if (config.features.enableGraphQL) {
    await server.register(graphqlPlugin);
  }

  server.route(apiRoutes);

  server.events.on("request", (request, event, tags) => {
    if (tags.error) {
      const errorMessage =
        event.error && typeof event.error === "object" && "message" in event.error
          ? String((event.error as { message?: unknown }).message ?? "Unknown error")
          : "Unknown error";
      // eslint-disable-next-line no-console
      console.error("Hapi request error", {
        method: request.method,
        path: request.path,
        error: errorMessage
      });
    }
  });

  await server.start();

  // eslint-disable-next-line no-console
  console.log(`Hapi server started at ${server.info.uri}`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start Hapi server", error instanceof Error ? error.stack : error);
  process.exit(1);
});
