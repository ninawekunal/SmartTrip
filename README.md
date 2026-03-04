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
- Backend: Next.js Route Handlers (Node runtime)
- Database: Supabase Postgres
- Directions provider: Mapbox Directions API
- Export provider: Google Maps URL format

## Setup

1. Use Node from `.nvmrc`:
   - `nvm install`
   - `nvm use`
2. Install dependencies:
   - `npm install`
3. Copy env:
   - `cp .env.example .env.local`
4. Fill keys in `.env.local`.
5. Run app:
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

## API Endpoints

Implemented endpoints:
1. `POST /api/trips`
2. `GET /api/trips/:id`
3. `PATCH /api/trips/:id`
4. `DELETE /api/trips/:id`
5. `POST /api/trips/:id/stops`
6. `PATCH /api/stops/:id`
7. `POST /api/trips/:id/stops/reorder`
8. `DELETE /api/stops/:id`
9. `GET /api/trips/:id/route?mode=walk`

Temporary auth for MVP API testing:
- send header `x-user-id: <uuid>`

## High-level Design Image

<img width="1874" height="965" alt="SmartTrip high-level design" src="https://github.com/user-attachments/assets/da6920a1-9302-4f21-b000-06ea18f51ba8" />
