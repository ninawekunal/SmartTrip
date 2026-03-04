# SmartTrip API Design (MVP) - Hapi Layer

Base path: `/api` (served by Hapi on `:4000`, proxied via Next app)

OpenAPI/Swagger:
- JSON spec: `/api/openapi`
- UI page: `/swagger`

Temporary auth for local MVP:
- Header: `x-user-id: <uuid>`
- Active trip context: cookie `smarttrip_active_trip_id` or header `x-active-trip-id`

## Context-first routes (no dynamic IDs in path)

### Trip endpoints

1. `GET /api/trips`
- Returns all trips for current `x-user-id`

2. `POST /api/trips`
- Body: `{ "title": "Rome Day 1", "city": "Rome", "startDate": "2026-03-10" }`
- Returns created trip

3. `POST /api/trips/select-active`
- Body: `{ "tripId": "<uuid>" }`
- Sets active trip cookie used by `.../current` endpoints

4. `GET /api/trips/current`
- Requires active trip context
- Returns active trip + ordered stops

5. `PATCH /api/trips/current`
- Requires active trip context
- Body: partial `title`, `city`, `startDate`

6. `DELETE /api/trips/current`
- Requires active trip context
- Deletes active trip and clears active-trip cookie

### Stop endpoints

7. `GET /api/stops/current-trip`
- Requires active trip context
- Returns ordered stops

8. `POST /api/stops/current-trip`
- Requires active trip context
- Body: `{ "name": "Colosseum", "lat": 41.8902, "lng": 12.4922, "notes": "..." }`

9. `PATCH /api/stops/current-trip`
- Requires active trip context
- Body: `{ "stopId": "<uuid>", "name": "New Name", "notes": "..." }`

10. `DELETE /api/stops/current-trip`
- Requires active trip context
- Body: `{ "stopId": "<uuid>" }`

11. `POST /api/stops/current-trip/reorder`
- Requires active trip context
- Body: `{ "stopIdsInOrder": ["uuid1", "uuid2", "uuid3"] }`

### Route endpoint

12. `GET /api/route/current-trip?mode=walk`
- Requires active trip context
- Computes/reads cached walking route (`stops_hash`)
- Returns distance/time + Google Maps URL

### Utilities

13. `GET /api/health/connections`
- Supabase + Mapbox connectivity check

14. `POST /graphql`
- GraphQL endpoint for component-focused reads/writes

15. `POST /api/dispatch/{endpointName}`
- Generic endpoint-name dispatcher for centralized handler invocation

## Examples

Create a trip:
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "content-type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -d '{"title":"Rome Day 1","city":"Rome","startDate":"2026-03-10"}'
```

Select active trip:
```bash
curl -X POST http://localhost:3000/api/trips/select-active \
  -H "content-type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -d '{"tripId":"<tripId>"}'
```

Read active trip:
```bash
curl http://localhost:3000/api/trips/current \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -H "x-active-trip-id: <tripId>"
```
