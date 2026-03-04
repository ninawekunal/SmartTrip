"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { tripStore } from "@/client/stores/trip-store";
import { PageShell } from "@/client/components/page-shell";

const DEV_USER_ID = "11111111-1111-1111-1111-111111111111";

export const TripsView = observer(function TripsView() {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripStore.loadTrips(DEV_USER_ID).catch((err) => {
      const message = err instanceof Error ? err.message : "Failed to load trips.";
      setError(message);
    });
  }, []);

  async function handleCreateTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await tripStore.createTrip(DEV_USER_ID, {
        title,
        city,
        startDate: startDate || undefined
      });
      setTitle("");
      setCity("");
      setStartDate("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create trip.";
      setError(message);
    }
  }

  return (
    <PageShell title="Trips" description="List and create trips for the active user.">
      <form onSubmit={handleCreateTrip} style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trip title" required />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
        <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
        <button type="submit" disabled={tripStore.submitting || tripStore.loading}>
          {tripStore.submitting ? "Creating..." : "Create Trip"}
        </button>
      </form>

      {tripStore.loading ? <p>Loading trips...</p> : null}
      {error ? <p className="status-bad">{error}</p> : null}

      {!tripStore.loading && tripStore.trips.length === 0 ? <p>No trips yet.</p> : null}

      <ul>
        {tripStore.trips.map((trip) => (
          <li key={trip.id}>
            <strong>{trip.title}</strong> - {trip.city}
          </li>
        ))}
      </ul>
    </PageShell>
  );
});
