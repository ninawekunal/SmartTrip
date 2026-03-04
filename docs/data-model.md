# SmartTrip Data Model (MVP)

## Entities

1. `trips`
- `id` (uuid, pk)
- `user_id` (uuid, owner)
- `title` (text, required)
- `city` (text, required)
- `start_date` (date, optional)
- `created_at`, `updated_at`

Example row:
```sql
insert into public.trips (user_id, title, city, start_date)
values ('11111111-1111-1111-1111-111111111111', 'Rome Day 1', 'Rome', '2026-03-10');
```

2. `stops`
- `id` (uuid, pk)
- `trip_id` (uuid, fk -> trips.id)
- `name` (text, required)
- `lat`, `lng` (coordinates)
- `place_id` (optional)
- `order_index` (int, required, >= 0)
- `notes` (optional)
- `created_at`, `updated_at`
- unique constraint: `(trip_id, order_index)`

Example row:
```sql
insert into public.stops (trip_id, name, lat, lng, order_index)
values ('trip-uuid', 'Colosseum', 41.8902, 12.4922, 0);
```

3. `routes`
- `id` (uuid, pk)
- `trip_id` (uuid, fk -> trips.id)
- `mode` (`walking`)
- `provider` (`mapbox` or `google`)
- `distance_m` (int)
- `duration_s` (int)
- `stops_hash` (text; cache key for ordered stops)
- `computed_at`, `created_at`, `updated_at`
- unique constraint: `(trip_id, mode, stops_hash)`

Example row:
```sql
insert into public.routes (trip_id, mode, provider, distance_m, duration_s, stops_hash)
values ('trip-uuid', 'walking', 'mapbox', 3200, 2500, 'ab12cd...');
```

## Why this shape

- `stops.order_index` makes user-defined ordering explicit and queryable.
- `routes.stops_hash` lets us cache route computations per exact stop sequence.
- Keeping route summary in DB prevents repeated API calls and controls provider cost.

Example query for ordered stops:
```sql
select id, name, order_index
from public.stops
where trip_id = 'trip-uuid'
order by order_index asc;
```

## Consistency rules

- Stop order uniqueness per trip is enforced at DB level.
- Deleting a trip cascades to stops/routes.
- RLS is enabled for all tables and ownership is tied to `auth.uid()`.

Example of uniqueness enforcement:
```sql
-- Fails if this trip already has a stop with order_index = 1
insert into public.stops (trip_id, name, lat, lng, order_index)
values ('trip-uuid', 'Trevi Fountain', 41.9009, 12.4833, 1);
```

Example of cascade delete:
```sql
delete from public.trips where id = 'trip-uuid';
-- Postgres automatically deletes matching rows in public.stops and public.routes
```
