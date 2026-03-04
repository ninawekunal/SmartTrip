"use client";

import { useEffect, useState } from "react";

type ServiceStatus = {
  connected: boolean;
  message: string;
};

type ConnectionsResponse = {
  supabase: ServiceStatus;
  mapbox: ServiceStatus;
};

export function ConnectionStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConnectionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/health/connections", { cache: "no-store" });
        const json = (await response.json()) as ConnectionsResponse;
        if (cancelled) {
          return;
        }
        setData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to check connections.";
        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="status-card">
        <h2>Connections</h2>
        <p className="status-loading">Checking Supabase and Mapbox...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="status-card">
        <h2>Connections</h2>
        <p className="status-bad">Check failed: {error}</p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="status-card">
      <h2>Connections</h2>
      <p className={data.supabase.connected ? "status-good" : "status-bad"}>
        Supabase: {data.supabase.connected ? "Connected" : "Not connected"}
      </p>
      <p className="status-message">{data.supabase.message}</p>
      <p className={data.mapbox.connected ? "status-good" : "status-bad"}>
        Mapbox: {data.mapbox.connected ? "Connected" : "Not connected"}
      </p>
      <p className="status-message">{data.mapbox.message}</p>
    </section>
  );
}
