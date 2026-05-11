import { supabase } from "./supabase";

export interface Trip {
  id?: string;
  feature_code: string;
  feature_name: string;
  level: string;
  color: string;
  note?: string;
  visited_at?: string;
  created_at?: string;
}

/** Upsert a single trip. Overwrites if feature_code already exists. */
export async function saveTrip(trip: Omit<Trip, "id" | "created_at">) {
  const { error } = await supabase
    .from("trips")
    .upsert(trip, { onConflict: "feature_code" });
  if (error) throw error;
}

/** Delete a trip by feature_code. */
export async function deleteTrip(feature_code: string) {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("feature_code", feature_code);
  if (error) throw error;
}

/** Load all trips as a code → color map (for map rendering). */
export async function loadColorMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("trips")
    .select("feature_code, color");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.feature_code, r.color]));
}

/** Load all trips as full rows (for sidebar list + CSV export). */
export async function loadAllTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
