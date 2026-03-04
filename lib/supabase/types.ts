export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      routes: {
        Row: {
          computed_at: string;
          created_at: string;
          distance_m: number;
          duration_s: number;
          id: string;
          mode: "walking";
          provider: "mapbox" | "google";
          stops_hash: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          computed_at?: string;
          created_at?: string;
          distance_m: number;
          duration_s: number;
          id?: string;
          mode?: "walking";
          provider: "mapbox" | "google";
          stops_hash: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          computed_at?: string;
          created_at?: string;
          distance_m?: number;
          duration_s?: number;
          id?: string;
          mode?: "walking";
          provider?: "mapbox" | "google";
          stops_hash?: string;
          trip_id?: string;
          updated_at?: string;
        };
      };
      stops: {
        Row: {
          created_at: string;
          id: string;
          lat: number;
          lng: number;
          name: string;
          notes: string | null;
          order_index: number;
          place_id: string | null;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lat: number;
          lng: number;
          name: string;
          notes?: string | null;
          order_index: number;
          place_id?: string | null;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          notes?: string | null;
          order_index?: number;
          place_id?: string | null;
          trip_id?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          city: string;
          created_at: string;
          id: string;
          start_date: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          id?: string;
          start_date?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          id?: string;
          start_date?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
