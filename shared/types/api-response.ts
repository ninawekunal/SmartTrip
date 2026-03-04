export type ApiMeta = {
  timestamp: string;
};

export type ApiSuccess<T> = {
  ok: true;
  endpoint: string;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  ok: false;
  endpoint: string;
  error: {
    message: string;
    statusCode: number;
    code: string;
  };
  meta: ApiMeta;
};

export type StandardApiResponse<T> = ApiSuccess<T> | ApiFailure;
