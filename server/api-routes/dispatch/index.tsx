import Boom from "@hapi/boom";
import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { ROUTE_NAMES } from "@/server/api-routes/route-names";
import * as tripsController from "@/server/controllers/trips-controller";
import * as stopsController from "@/server/controllers/stops-controller";
import * as routeController from "@/server/controllers/route-controller";
import * as healthController from "@/server/controllers/health-controller";
import * as openapiController from "@/server/controllers/openapi-controller";
import { EndpointName, ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";
import { createEndpointHandler } from "@/server/api-routes/utils/endpoint-wrapper";

const executeByEndpointName = async (request: Request, h: ResponseToolkit) => {
  const endpointName = request.params.endpointName as EndpointName;

  switch (endpointName) {
    case ENDPOINT_NAMES.OPENAPI_GET:
      return createEndpointHandler(endpointName, openapiController.getOpenApiDocument)(request, h);
    case ENDPOINT_NAMES.HEALTH_CONNECTIONS:
      return createEndpointHandler(endpointName, healthController.connectionsHealth)(request, h);

    case ENDPOINT_NAMES.TRIPS_LIST:
      return createEndpointHandler(endpointName, tripsController.listTrips)(request, h);
    case ENDPOINT_NAMES.TRIPS_CREATE:
      return createEndpointHandler(endpointName, tripsController.createTrip)(request, h);
    case ENDPOINT_NAMES.TRIPS_SELECT_ACTIVE:
      return createEndpointHandler(endpointName, tripsController.selectActiveTrip)(request, h);
    case ENDPOINT_NAMES.TRIPS_GET_ACTIVE:
      return createEndpointHandler(endpointName, tripsController.getActiveTrip)(request, h);
    case ENDPOINT_NAMES.TRIPS_UPDATE_ACTIVE:
      return createEndpointHandler(endpointName, tripsController.updateActiveTrip)(request, h);
    case ENDPOINT_NAMES.TRIPS_DELETE_ACTIVE:
      return createEndpointHandler(endpointName, tripsController.deleteActiveTrip)(request, h);

    case ENDPOINT_NAMES.STOPS_LIST_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, stopsController.listStopsForActiveTrip)(request, h);
    case ENDPOINT_NAMES.STOPS_CREATE_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, stopsController.createStopForActiveTrip)(request, h);
    case ENDPOINT_NAMES.STOPS_UPDATE_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, stopsController.updateStopForActiveTrip)(request, h);
    case ENDPOINT_NAMES.STOPS_DELETE_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, stopsController.deleteStopForActiveTrip)(request, h);
    case ENDPOINT_NAMES.STOPS_REORDER_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, stopsController.reorderStopsForActiveTrip)(request, h);

    case ENDPOINT_NAMES.ROUTE_COMPUTE_ACTIVE_TRIP:
      return createEndpointHandler(endpointName, routeController.computeRouteForActiveTrip)(request, h);

    default:
      throw Boom.notFound(`No handler found for endpoint '${endpointName}'.`);
  }
};

export const dispatchRoutes: ServerRoute[] = [
  {
    method: "POST",
    path: "/api/dispatch/{endpointName}",
    options: { id: ROUTE_NAMES.API_DISPATCH, tags: ["api", "dispatch"] },
    handler: executeByEndpointName
  }
];
