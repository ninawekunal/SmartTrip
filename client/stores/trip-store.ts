import { makeAutoObservable, runInAction } from "mobx";
import { fetchWrapper } from "@/client/utils/use-fetch-wrapper";
import { ENDPOINT_NAMES } from "@/shared/constants/endpoint-names";

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
      const response = await fetchWrapper<{ trips: Trip[] }>(
        "/api/trips",
        {
          method: "GET",
          headers: {
            "x-user-id": userId
          }
        },
        { fallbackEndpointName: ENDPOINT_NAMES.TRIPS_LIST }
      );
      if (!response.ok) {
        throw new Error(response.error.message);
      }

      runInAction(() => {
        this.trips = response.data.trips ?? [];
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
      const response = await fetchWrapper<{ trip: Trip }>(
        "/api/trips",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": userId
          },
          body: JSON.stringify(input)
        },
        { fallbackEndpointName: ENDPOINT_NAMES.TRIPS_CREATE }
      );
      if (!response.ok || !response.data.trip) {
        throw new Error(response.ok ? "Failed to create trip." : response.error.message);
      }

      runInAction(() => {
        this.trips = [response.data.trip, ...this.trips];
      });
    } finally {
      runInAction(() => {
        this.submitting = false;
      });
    }
  }
}

export const tripStore = new TripStore();
