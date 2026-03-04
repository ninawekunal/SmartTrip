# Next.js Crash Course for SmartTrip MVP

This guide covers only the Next.js concepts you need for this project.

## 1. Why Next.js (instead of plain React)?

React is a UI library.  
Next.js is a framework that includes React plus:
- File-based routing
- API routes on the server
- Server rendering options
- App structure for production apps

For SmartTrip, we need both frontend pages and backend APIs in one repo. Next.js is a good fit.

## 2. App Router basics

We are using the `app/` directory.

Key files:
- `app/layout.tsx`: shared page wrapper (root layout)
- `app/page.tsx`: homepage (`/`)
- `app/swagger/page.tsx`: page at `/swagger`

Mental model:
- Folder = route segment
- `page.tsx` = UI for that route
- `layout.tsx` = shared wrapper for children

## 3. Dynamic route segments (`[id]`)

Why needed:
- Trip IDs are dynamic. We don't know them at build time.
- We need one API handler pattern that works for every trip.

Example:
- File: `app/api/trips/[id]/route.ts`
- Handles:
  - `GET /api/trips/123`
  - `PATCH /api/trips/abc`
  - `DELETE /api/trips/xyz`

Important:
- You do NOT create one folder per trip record.
- `[id]` is a template placeholder, not a real DB record folder.

## 4. Route Handlers (backend in Next.js)

In App Router, API handlers are `route.ts` files.

Example in this project:
- `app/api/trips/route.ts` (`POST`)
- `app/api/trips/[id]/route.ts` (`GET/PATCH/DELETE`)
- `app/api/trips/[id]/stops/reorder/route.ts` (`POST`)

Each exported function matches HTTP method:
```ts
export async function GET() {}
export async function POST() {}
export async function PATCH() {}
export async function DELETE() {}
```

## 5. Reading dynamic params in handlers

Example pattern:
```ts
type RouteContext = { params: Promise<{ id: string }> };
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
}
```

`id` comes from URL segment `[id]`.

## 6. Server Components vs Client Components

By default, files in `app/` are Server Components.

Use Client Component only when needed (state/hooks/browser-only libs):
- Add `"use client"` at top.
- Example: `app/swagger/page.tsx` is client because it loads Swagger UI in browser.

Rule of thumb:
- Keep most pages/components server by default.
- Use client only for interactive UI.

## 7. Environment variables in Next.js

Two categories:
- `NEXT_PUBLIC_*`: safe for browser exposure
- Non-public vars: server-only

In this project:
- Validated in `lib/env.ts`
- Used by server code (Supabase service client, Mapbox fetch logic)

## 8. Validation pattern

Use `zod` schemas for incoming JSON.

Where:
- `lib/api/schemas.ts`

Why:
- Prevent malformed requests
- Return clear `400` responses

## 9. Folder structure in this MVP

- `app/`: pages + API route handlers
- `lib/`: shared server/business utilities (env, supabase, mapbox, schemas)
- `supabase/migrations/`: SQL schema history
- `docs/`: learning and architecture docs

## 10. OpenAPI + Swagger in Next.js

We expose API docs as:
- `/api/openapi` -> JSON spec
- `/swagger` -> interactive UI

Useful during development:
- See contract quickly
- Try endpoints without building a custom test page first

## 11. Common mistakes to avoid

1. Putting browser-only code in server components.
2. Forgetting to validate request body.
3. Returning raw DB errors to clients in production.
4. Mixing business logic directly inside UI components.
5. Hardcoding secrets in code instead of env vars.

## 12. What to learn next (in order)

1. Build a simple trip list page (`/trips`)
2. Build trip detail page with ordered stops
3. Add drag-and-drop reorder UI
4. Call reorder API and refresh stop list
5. Show route distance/time + export-to-Google button

This sequence matches the SmartTrip MVP flow and keeps complexity manageable.
