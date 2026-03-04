# SmartTrip API Design (MVP)

Base path in app: `/api`

Next.js folder naming note:
- A folder like `[id]` is a dynamic route segment.
- Example:
  - File path: `app/api/trips/[id]/route.ts`
  - URL example: `/api/trips/8c2f...`
  - Here, `[id]` receives the trip id from the URL.

OpenAPI/Swagger:
- JSON spec: `/api/openapi`
- UI page: `/swagger`

Temporary auth contract for local MVP:
- Header: `x-user-id: <uuid>`

Example:
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "content-type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -d '{"title":"Rome Day 1","city":"Rome","startDate":"2026-03-10"}'
```

## Trip endpoints

1. `POST /api/trips`
- Body: `{ "title": "Rome Day 1", "city": "Rome", "startDate": "2026-03-10" }`
- Returns: created `trip`

2. `GET /api/trips/:id`
- Returns: trip + stops

3. `PATCH /api/trips/:id`
- Body: partial of `title`, `city`, `startDate`
- Returns: updated trip

4. `DELETE /api/trips/:id`
- Returns: `{ "deleted": true }`

## Stop endpoints

5. `POST /api/trips/:id/stops`
- Body: `{ "name": "Colosseum", "lat": 41.8902, "lng": 12.4922, "notes": "...", "placeId": "..." }`
- Behavior: appends stop to end of order
- Returns: created stop

6. `PATCH /api/stops/:id`
- Body: `{ "name": "New name", "notes": "optional" }`
- Returns: updated stop

7. `POST /api/trips/:id/stops/reorder`
- Body: `{ "stopIdsInOrder": ["uuid1", "uuid2", "uuid3"] }`
- Behavior: API validates full stop set and writes the new order (two-phase update to avoid unique collisions)
- Returns: full ordered stop list
- Note: this is app-level multi-write logic. A later improvement is wrapping reorder in a DB transaction for strict all-or-nothing behavior.

Example:
```bash
curl -X POST http://localhost:3000/api/trips/<tripId>/stops/reorder \
  -H "content-type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -d '{"stopIdsInOrder":["stopC","stopA","stopB"]}'
```

8. `DELETE /api/stops/:id`
- Returns: `{ "deleted": true }`

## Route endpoint

9. `GET /api/trips/:id/route?mode=walk`
- Reads ordered stops
- Computes `stops_hash`
- Reuses cached route if hash exists
- Otherwise calls Mapbox Directions walking API
- Stores summary in `routes`
- Returns route summary + `googleMapsUrl`

Example:
```bash
curl "http://localhost:3000/api/trips/<tripId>/route?mode=walk" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111"
```

## Expected failures

- `400`: validation/unsupported mode
- `401`: missing `x-user-id`
- `404`: resource not found for actor
- `500`: provider/database failures
