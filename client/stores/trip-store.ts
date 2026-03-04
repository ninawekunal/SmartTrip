import { makeAutoObservable, runInAction } from "mobx";

type Trip = {
  id: string;
  title: string;
  city: string;
  start_date: string | null;
  created_at: string;
};

class TripStore {
  trips: Trip[] = [];
  loading = false;
  submitting = false;

  constructor() {
    makeAutoObservable(this);
  }

  async loadTrips(userId: string) {
    this.loading = true;
    try {
      const response = await fetch("/api/trips", {
        method: "GET",
        headers: {
          "x-user-id": userId
        }
      });

      const payload = (await response.json()) as { trips?: Trip[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load trips.");
      }

      runInAction(() => {
        this.trips = payload.trips ?? [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createTrip(userId: string, input: { title: string; city: string; startDate?: string }) {
    this.submitting = true;

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify(input)
      });

      const payload = (await response.json()) as { trip?: Trip; error?: string };
      if (!response.ok || !payload.trip) {
        throw new Error(payload.error ?? "Failed to create trip.");
      }

      runInAction(() => {
        this.trips = [payload.trip!, ...this.trips];
      });
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  }
}

export const tripStore = new TripStore();
