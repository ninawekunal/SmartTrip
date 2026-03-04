import { createHash } from "node:crypto";
import { Database } from "@/lib/supabase/types";

type StopRow = Database["public"]["Tables"]["stops"]["Row"];

export function hashOrderedStops(stops: StopRow[]): string {
  const payload = [...stops]
    .sort((a, b) => a.order_index - b.order_index)
    .map((stop) => `${stop.id}:${stop.order_index}:${stop.lat}:${stop.lng}`)
    .join("|");

  return createHash("sha256").update(payload).digest("hex");
}
