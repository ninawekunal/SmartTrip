# Postgres Crash Course for SmartTrip MVP

This is a short, practical guide for the concepts used in this project.

## 1. Schema and `public.<name>`

- Postgres groups tables in namespaces called schemas.
- `public` is the default schema.
- `public.trips` means table `trips` inside schema `public`.

Example:
```sql
select * from public.trips;
```

Important:
- `public` does NOT mean "public on the internet".
- It is only a database namespace name.
- Access is still controlled by DB roles, API keys, and RLS policies.

## 2. `gen_random_uuid()`

- `gen_random_uuid()` generates UUID values for `id` columns.
- In this project, it works because we enable extension `pgcrypto`.

Example:
```sql
create extension if not exists "pgcrypto";
select gen_random_uuid();
```

What `create extension` does:
- It installs/enables a Postgres extension package in your database.
- After enabling `pgcrypto`, its functions (like `gen_random_uuid`) become available in SQL.

## 3. `references` (foreign key)

- `references public.trips(id)` means this value must match an existing trip id.
- This prevents orphan rows.

Example:
```sql
trip_id uuid not null references public.trips(id) on delete cascade
```

Rule of thumb for `on delete cascade`:
- Use it when child rows have no meaning without the parent.
- In SmartTrip:
  - `stops` without a `trip` are useless.
  - `routes` without a `trip` are useless.
- Put it on the child foreign key definition (for example, `stops.trip_id` and `routes.trip_id`).

## 4. `on delete cascade`

- If a parent row is deleted, Postgres auto-deletes child rows.
- Here: delete trip => delete its stops + routes.

Example:
```sql
delete from public.trips where id = 'trip-uuid';
```

## 5. Indexes

- Index = data structure for faster lookup/sorting.
- We create:
  - `(trip_id, order_index)` to quickly fetch ordered stops for one trip.

Example from migration:
```sql
create index if not exists idx_stops_trip_order
on public.stops(trip_id, order_index asc);
```

About index naming:
- `order_index` is a table column.
- `idx_stops_trip_order` is just the name of the index object.
- You usually do NOT reference the index name in normal app queries.
- Postgres query planner automatically decides when to use it.

## 6. Uniqueness constraint

- `unique (trip_id, order_index)` means same position cannot be reused in one trip.

Bad case blocked by DB:
```sql
-- If trip already has order_index 1, this insert fails
insert into public.stops (trip_id, name, lat, lng, order_index)
values ('trip-uuid', 'Pantheon', 41.8986, 12.4768, 1);
```

## 7. Transactions (all-or-nothing writes)

- `begin ... commit` groups multiple writes.
- If any step fails, `rollback` reverts all changes.

Why this matters for reorder:
- Reorder needs many updates.
- If half the updates succeed and request fails, order can be corrupted.

Simple transaction example:
```sql
begin;
update public.stops set order_index = 100 where id = 'a';
update public.stops set order_index = 0 where id = 'b';
commit;
```

Failure-safe flow:
```sql
begin;
-- many updates...
-- if error:
rollback;
```

Concrete reorder bad-case:
1. Current order: A(0), B(1), C(2)
2. User wants: C(0), A(1), B(2)
3. Update 1 succeeds, update 2 fails (network/error)
4. Without transaction: partial state remains in DB
5. With transaction: DB rolls back to original A(0), B(1), C(2)

## 8. `stops_hash` and cache key

- Cache key = identifier for a computed result.
- `stops_hash` is built from ordered stops (`id + order + coords`) and hashed.
- If order changes, hash changes, so cached route is no longer reused incorrectly.

Example:
- Sequence A -> B -> C => hash `H1`
- Sequence A -> C -> B => hash `H2` (different)
- We only reuse route when hash matches.

Where we cache:
- In Postgres table `public.routes` (not in-memory cache).
- We store: `trip_id`, `mode`, `stops_hash`, `distance_m`, `duration_s`, `computed_at`.

How this avoids repeated Mapbox calls:
1. API computes current `stops_hash`.
2. API looks up existing row in `routes` for same `trip_id + mode + stops_hash`.
3. If found, return it immediately (skip Mapbox API call).
4. If not found, call Mapbox once, save result, and reuse later.

Why useful:
- Lower API cost
- Lower latency
- Better reliability when provider has rate limits

## 9. `computed_at`

- Time when distance/time was computed.
- Helps you see if route data is stale.

Example:
```sql
select distance_m, duration_s, computed_at
from public.routes
where trip_id = 'trip-uuid';
```

What we use Mapbox for:
- Walking route metadata for ordered stops.
- Specifically: distance in meters + duration in seconds.

## 10. RLS and ownership policies

- RLS = Row Level Security (database-level authorization).
- Policy checks who can read/write each row.
- In this project: a user can only access rows connected to their own trips.

Example policy idea:
```sql
using (auth.uid() = user_id)
```

Important:
- `alter table ... enable row level security;` only turns RLS on.
- You also need policies, otherwise access is denied by default for table operations.

What `for all to authenticated` means:
- `for all` = policy applies to select/insert/update/delete.
- `to authenticated` = only logged-in users (Supabase auth role `authenticated`) can use this policy.

What SmartTrip policies do:
1. `trip owner access`
- User can only access trips where `trips.user_id = auth.uid()`.
2. `stop owner access`
- User can only access stops whose parent trip belongs to that user.
3. `route owner access`
- User can only access routes whose parent trip belongs to that user.

## 11. Migrations and versioning in Supabase

- Each SQL file in `supabase/migrations/` is one schema change step.
- New changes should go into a new migration file.
- This keeps history and reproducibility clean.

Supabase UI note:
- You see current schema in UI.
- Migration history is tracked through migration files/CLI workflow.
- Treat migration files as the source of truth in Git.

About compatibility:
- Create a new migration for each schema change.
- In production, prefer safe incremental changes:
  - add new column/table first,
  - update app,
  - remove old column later.

## 12. Common Postgres types used here

- `uuid`: unique identifier type
- `timestamptz`: timestamp with timezone
- `double precision`: floating-point number (used for lat/lng)

Examples:
```sql
id uuid primary key default gen_random_uuid(),
lat double precision not null,
created_at timestamptz not null default now()
```

## 13. Trigger and `set_updated_at`

What is a trigger:
- A trigger is code that runs automatically on table events (`insert`, `update`, `delete`).

What `set_updated_at` does:
- Before an `update`, it sets `updated_at = now()` automatically.
- This keeps timestamps consistent without relying on app code.

## 14. What is `plpgsql`

- `plpgsql` is Postgres's procedural language.
- It lets you write functions with variables, conditions, and control flow.

## 15. Should routes be globally shared by route hash only?

Idea:
- Could we use a global `route_hash` and share across all users?

Yes, technically possible, but MVP tradeoffs:
- Hash must include exact coordinates, mode, and provider settings.
- You must handle privacy concerns (cross-user reuse visibility).
- You need TTL/invalidation strategy when provider data updates.
- For MVP, trip-scoped caching is simpler and safer.
