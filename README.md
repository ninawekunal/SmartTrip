# SmartTrip

SmartTrip MVP is a trip planner where a user creates a trip, adds ordered stops, gets walking route metadata (distance + time), and exports that ordered route to Google Maps.

## Problem Statement (MVP)

Users need a simple way to:
1. Create a trip.
2. Add and reorder stops.
3. Compute walking distance/time for that exact stop order.
4. Export to Google Maps.

Out of scope for MVP:
- Booking/calendar sync
- Budgets/payments
- Reviews
- AI itinerary generation

## Architecture

- Frontend: Next.js App Router (React + TypeScript)
- Backend: Hapi server (`server/`) with controller/data-source layers
- Database: Supabase Postgres
- Directions provider: Mapbox Directions API
- Export provider: Google Maps URL format

## Layered Structure

This repo now uses a dedicated layered architecture:

- `server/`
  - `api-routes/`: endpoint registry and route definitions
  - `controllers/`: request orchestration and handler methods
  - `data-sources/`: downstream API + DB access
  - `plugins/`: request context and GraphQL plugins
  - `graphql/`: schema and execution
  - `stores/`: runtime MobX state (server-side scaffolding)
- `client/`
  - `views/`: UI scaffolding by route
  - `controllers/`: map pages to views
  - `components/`: shared presentational components
  - `stores/`: MobX client stores
- `shared/`
  - `config/`, `constants/`, `types/`, `utils/`: shared code between server/client
- `config/global.config.jsonc`
  - Global toggles, Hapi settings, endpoint security levels, downstream URLs, webpack settings

Notes:
- Next.js API handlers were removed; API calls are handled by Hapi.
- Next.js proxies `/api/*` and `/graphql` to Hapi using rewrites.
- Active trip context is read from cookie (`smarttrip_active_trip_id`) or `x-active-trip-id`.

## Setup

1. Use Node from `.nvmrc`:
   - `nvm install`
   - `nvm use`
2. Install dependencies:
   - `npm install`
3. Copy env:
   - `cp .env.example .env.local`
4. Fill keys in `.env.local`.
5. Run app (client + server together):
   - `npm run dev`
6. Open API docs:
   - `http://localhost:3000/swagger`
7. Check integration health:
   - `http://localhost:3000/api/health/connections`
   - or see the connection panel on the home page (`/`)

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `MAPBOX_ACCESS_TOKEN`

## Database

Migration file:
- `supabase/migrations/20260303124500_init_smarttrip.sql`

Core tables:
- `trips`
- `stops`
- `routes`

Why schema is under `supabase/migrations/`:
- Supabase applies SQL files in this folder in order.
- Each file is a versioned history of schema changes.
- This lets teams reproduce DB state safely across local/staging/prod.

Learning docs:
- `docs/data-model.md` (entities + examples)
- `docs/api-design.md` (endpoint contracts + curl examples)
- `docs/postgres-crash-course.md` (junior-friendly SQL concepts for this MVP)
- `docs/nextjs-crash-course.md` (Next.js concepts needed for this MVP)
- `docs/architecture-separation.md` (client/server/shared boundaries and use cases)

## API Endpoints

Implemented endpoints:
1. `GET /api/openapi`
2. `GET /api/health/connections`
3. `GET /api/trips`
4. `POST /api/trips`
5. `POST /api/trips/select-active` (sets active trip cookie)
6. `GET /api/trips/current`
7. `PATCH /api/trips/current`
8. `DELETE /api/trips/current`
9. `GET /api/stops/current-trip`
10. `POST /api/stops/current-trip`
11. `PATCH /api/stops/current-trip` (payload includes `stopId`)
12. `DELETE /api/stops/current-trip` (payload includes `stopId`)
13. `POST /api/stops/current-trip/reorder`
14. `GET /api/route/current-trip?mode=walk`
15. `POST /graphql`
16. `POST /api/dispatch/{endpointName}` (generic endpoint-name dispatcher)

Temporary auth for MVP API testing:
- send header `x-user-id: <uuid>`

## High-level Design Image

<img width="1874" height="965" alt="SmartTrip high-level design" src="https://github.com/user-attachments/assets/da6920a1-9302-4f21-b000-06ea18f51ba8" />
