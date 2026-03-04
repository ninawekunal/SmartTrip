import Boom from "@hapi/boom";
import { Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { EndpointName } from "@/shared/constants/endpoint-names";
import { getGlobalConfig } from "@/shared/config/load-global-config";
import { StandardApiResponse } from "@/shared/types/api-response";
import { getRequestContext } from "@/server/utils/request-context";

type EndpointHandler = (request: Request, h: ResponseToolkit) => Promise<unknown> | unknown;

const isResponseObject = (value: unknown): value is ResponseObject => {
  return !!value && typeof value === "object" && "variety" in (value as Record<string, unknown>);
};

const buildSuccess = <T>(endpoint: EndpointName, data: T): StandardApiResponse<T> => ({
  ok: true,
  endpoint,
  data,
  meta: {
    timestamp: new Date().toISOString()
  }
});

const buildFailure = (endpoint: EndpointName, error: { message: string; statusCode: number; code: string }): StandardApiResponse<never> => ({
  ok: false,
  endpoint,
  error,
  meta: {
    timestamp: new Date().toISOString()
  }
});

const enforceAccess = (request: Request, endpoint: EndpointName) => {
  const config = getGlobalConfig();
  const level = config.endpointSecurity[endpoint] ?? "none";
  const context = getRequestContext(request);

  if ((level === "user" || level === "user+activeTrip") && !context.userId) {
    throw Boom.unauthorized("Missing x-user-id header.");
  }

  if (level === "user+activeTrip" && !context.activeTripId) {
    throw Boom.badRequest("Missing active trip id in cookie or x-active-trip-id header.");
  }
};

export const createEndpointHandler = (endpoint: EndpointName, handler: EndpointHandler) => {
  return async (request: Request, h: ResponseToolkit) => {
    try {
      enforceAccess(request, endpoint);
      const result = await handler(request, h);

      if (isResponseObject(result)) {
        return result;
      }

      return h.response(buildSuccess(endpoint, result)).code(200);
    } catch (error) {
      const boomError = Boom.isBoom(error)
        ? error
        : Boom.badImplementation(error instanceof Error ? error.message : "Internal server error.");

      // eslint-disable-next-line no-console
      console.error(`[${endpoint}] request failed`, {
        message: boomError.message,
        statusCode: boomError.output.statusCode,
        payload: boomError.output.payload
      });

      return h
        .response(
          buildFailure(endpoint, {
            message: boomError.message,
            statusCode: boomError.output.statusCode,
            code: boomError.output.payload.error
          })
        )
        .code(boomError.output.statusCode);
    }
  };
};
