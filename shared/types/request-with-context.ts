import { Request } from "@hapi/hapi";
import { RequestContext } from "@/shared/types/request-context";

export type RequestWithContext = Request & {
  app: Request["app"] & {
    context?: RequestContext;
  };
};
