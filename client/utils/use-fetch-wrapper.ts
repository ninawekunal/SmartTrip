import { StandardApiResponse } from "@/shared/types/api-response";

type FetchWrapperOptions = {
  fallbackEndpointName?: string;
};

const buildFallbackError = <T>(endpoint: string, statusCode: number, message: string): StandardApiResponse<T> => ({
  ok: false,
  endpoint,
  error: {
    message,
    statusCode,
    code: "FetchError"
  },
  meta: {
    timestamp: new Date().toISOString()
  }
});

export const fetchWrapper = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchWrapperOptions
): Promise<StandardApiResponse<T>> => {
  const fallbackEndpoint = options?.fallbackEndpointName ?? "unknown";

  try {
    const response = await fetch(input, init);
    const payload = (await response.json()) as StandardApiResponse<T> | { message?: string };

    if (payload && typeof payload === "object" && "ok" in payload) {
      return payload as StandardApiResponse<T>;
    }

    if (!response.ok) {
      return buildFallbackError<T>(
        fallbackEndpoint,
        response.status,
        (payload as { message?: string })?.message ?? "Request failed."
      );
    }

    return {
      ok: true,
      endpoint: fallbackEndpoint,
      data: payload as T,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return buildFallbackError<T>(
      fallbackEndpoint,
      500,
      error instanceof Error ? error.message : "Unexpected fetch error."
    );
  }
};
