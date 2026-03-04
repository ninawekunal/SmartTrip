import Hapi from "@hapi/hapi";
import { apiRoutes } from "@/server/api-routes/routes";
import { getGlobalConfig } from "@/shared/config/load-global-config";
import { graphqlPlugin } from "@/server/plugins/graphql-plugin";
import { requestContextPlugin } from "@/server/plugins/request-context-plugin";

async function bootstrap() {
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
  await server.start();

  // eslint-disable-next-line no-console
  console.log(`Hapi server started at ${server.info.uri}`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start Hapi server", error);
  process.exit(1);
});
