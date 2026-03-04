import { Plugin } from "@hapi/hapi";
import { getGlobalConfig } from "@/shared/config/load-global-config";
import { RequestContext } from "@/shared/types/request-context";

declare module "@hapi/hapi" {
  interface RequestApplicationState {
    context?: RequestContext;
  }
}

export const requestContextPlugin: Plugin<undefined> = {
  name: "request-context-plugin",
  register: async (server) => {
    const config = getGlobalConfig();

    server.ext("onRequest", (request, h) => {
      const userId = (request.headers["x-user-id"] as string | undefined) ?? null;
      const cookies = (request.state ?? {}) as Record<string, string | undefined>;
      const activeTripId =
        cookies[config.auth.activeTripCookieName] ??
        ((request.headers["x-active-trip-id"] as string | undefined) ?? null);

      const authHeader = (request.headers[config.auth.jwtHeaderName] as string | undefined) ?? null;
      const jwt = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      request.app.context = { userId, activeTripId, jwt };
      return h.continue;
    });
  }
};
