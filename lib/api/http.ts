import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Missing x-user-id header (temporary auth for MVP)." },
    { status: 401 }
  );
}

export function internalError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}
