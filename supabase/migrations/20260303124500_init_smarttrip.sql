create extension if not exists "pgcrypto";

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null check (char_length(title) > 0 and char_length(title) <= 120),
  city text not null check (char_length(city) > 0 and char_length(city) <= 120),
  start_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null check (char_length(name) > 0 and char_length(name) <= 120),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  place_id text null,
  order_index integer not null check (order_index >= 0),
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, order_index)
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  mode text not null check (mode in ('walking')),
  provider text not null check (provider in ('mapbox', 'google')),
  distance_m integer not null check (distance_m >= 0),
  duration_s integer not null check (duration_s >= 0),
  stops_hash text not null,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, mode, stops_hash)
);

create index if not exists idx_trips_user_created on public.trips(user_id, created_at desc);
create index if not exists idx_stops_trip_order on public.stops(trip_id, order_index asc);
create index if not exists idx_routes_trip_mode on public.routes(trip_id, mode);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at
before update on public.trips
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_stops_updated_at on public.stops;
create trigger trg_stops_updated_at
before update on public.stops
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_routes_updated_at on public.routes;
create trigger trg_routes_updated_at
before update on public.routes
for each row execute procedure public.set_updated_at();

alter table public.trips enable row level security;
alter table public.stops enable row level security;
alter table public.routes enable row level security;

drop policy if exists "trip owner access" on public.trips;
create policy "trip owner access" on public.trips
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "stop owner access" on public.stops;
create policy "stop owner access" on public.stops
for all to authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = stops.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = stops.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "route owner access" on public.routes;
create policy "route owner access" on public.routes
for all to authenticated
using (
  exists (
    select 1
    from public.trips
    where trips.id = routes.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = routes.trip_id
      and trips.user_id = auth.uid()
  )
);
