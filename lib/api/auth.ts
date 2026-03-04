import { NextRequest } from "next/server";

export const USER_ID_HEADER = "x-user-id";

export function getActorId(request: NextRequest): string | null {
  return request.headers.get(USER_ID_HEADER);
}
