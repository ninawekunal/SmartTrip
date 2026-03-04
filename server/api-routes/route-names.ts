import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

export const ROUTE_NAMES = {
  ...ENDPOINT_NAMES,
  API_DISPATCH: "api.dispatch",
  GRAPHQL: "graphql.execute"
} as const;
