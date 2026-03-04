import { createServiceClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type TripRow = Database["public"]["Tables"]["trips"]["Row"];
type StopRow = Database["public"]["Tables"]["stops"]["Row"];

export async function listTripsByUser(userId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TripRow[];
}

export async function createTrip(input: {
  userId: string;
  title: string;
  city: string;
  startDate?: string | null;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: input.userId,
      title: input.title,
      city: input.city,
      start_date: input.startDate ?? null
    } as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as TripRow;
}

export async function getTripByIdAndUser(tripId: string, userId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as TripRow;
}

export async function updateTripByIdAndUser(input: {
  tripId: string;
  userId: string;
  title?: string;
  city?: string;
  startDate?: string | null;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      title: input.title,
      city: input.city,
      start_date: input.startDate
    } as never)
    .eq("id", input.tripId)
    .eq("user_id", input.userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as TripRow;
}

export async function deleteTripByIdAndUser(tripId: string, userId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listStopsByTrip(tripId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("stops")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as StopRow[];
}

export async function createStop(input: {
  tripId: string;
  name: string;
  lat: number;
  lng: number;
  placeId?: string;
  notes?: string;
}) {
  const supabase = createServiceClient();
  const { data: lastStop } = await supabase
    .from("stops")
    .select("order_index")
    .eq("trip_id", input.tripId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = ((lastStop as { order_index?: number } | null)?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("stops")
    .insert({
      trip_id: input.tripId,
      name: input.name,
      lat: input.lat,
      lng: input.lng,
      place_id: input.placeId ?? null,
      notes: input.notes ?? null,
      order_index: nextOrderIndex
    } as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as StopRow;
}

export async function updateStopByTrip(input: {
  tripId: string;
  stopId: string;
  name?: string;
  notes?: string | null;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("stops")
    .update({
      name: input.name,
      notes: input.notes
    } as never)
    .eq("id", input.stopId)
    .eq("trip_id", input.tripId)
    .select("*")
    .single();

  if (error) throw error;
  return data as StopRow;
}

export async function deleteStopByTrip(input: { tripId: string; stopId: string }) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("stops")
    .delete()
    .eq("id", input.stopId)
    .eq("trip_id", input.tripId);

  if (error) throw error;
}

export async function reorderStopsByTrip(tripId: string, stopIdsInOrder: string[]) {
  const supabase = createServiceClient();
  const currentStops = await listStopsByTrip(tripId);
  const currentIds = new Set(currentStops.map((stop) => stop.id));

  if (currentIds.size !== stopIdsInOrder.length || !stopIdsInOrder.every((id) => currentIds.has(id))) {
    throw new Error("stopIdsInOrder must include each trip stop exactly once.");
  }

  for (const [tempIndex, stopId] of Array.from(currentIds).entries()) {
    const { error } = await supabase
      .from("stops")
      .update({ order_index: 100000 + tempIndex } as never)
      .eq("id", stopId)
      .eq("trip_id", tripId);
    if (error) throw error;
  }

  for (const [index, stopId] of stopIdsInOrder.entries()) {
    const { error } = await supabase
      .from("stops")
      .update({ order_index: index } as never)
      .eq("id", stopId)
      .eq("trip_id", tripId);
    if (error) throw error;
  }

  return listStopsByTrip(tripId);
}

export async function getRouteByTripModeAndHash(input: {
  tripId: string;
  mode: "walking";
  stopsHash: string;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("trip_id", input.tripId)
    .eq("mode", input.mode)
    .eq("stops_hash", input.stopsHash)
    .maybeSingle();

  if (error) throw error;
  return data as Database["public"]["Tables"]["routes"]["Row"] | null;
}

export async function upsertRoute(input: {
  tripId: string;
  mode: "walking";
  provider: "mapbox";
  distanceM: number;
  durationS: number;
  stopsHash: string;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("routes")
    .upsert(
      {
        trip_id: input.tripId,
        mode: input.mode,
        provider: input.provider,
        distance_m: input.distanceM,
        duration_s: input.durationS,
        stops_hash: input.stopsHash,
        computed_at: new Date().toISOString()
      } as never,
      { onConflict: "trip_id,mode,stops_hash" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as Database["public"]["Tables"]["routes"]["Row"];
}
