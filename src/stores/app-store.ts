"use client";

import { create } from "zustand";
import type { Level } from "admdongkor";
import type { Trip } from "@/lib/db";

interface AppState {
  level: Level;
  colorMap: Record<string, string>;   // featureCode → hex
  trips: Trip[];                       // full trip rows for sidebar

  setLevel: (l: Level) => void;
  setColor: (code: string, color: string) => void;
  loadColorMap: (map: Record<string, string>) => void;
  setTrips: (trips: Trip[]) => void;
  addOrUpdateTrip: (trip: Trip) => void;
  removeTrip: (code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  level: "sgg",
  colorMap: {},
  trips: [],

  setLevel: (l) => set({ level: l }),

  setColor: (code, color) =>
    set((s) => ({ colorMap: { ...s.colorMap, [code]: color } })),

  loadColorMap: (map) => set({ colorMap: map }),

  setTrips: (trips) => set({ trips }),

  addOrUpdateTrip: (trip) =>
    set((s) => {
      const exists = s.trips.findIndex((t) => t.feature_code === trip.feature_code);
      if (exists >= 0) {
        const updated = [...s.trips];
        updated[exists] = trip;
        return { trips: updated };
      }
      return { trips: [trip, ...s.trips] };
    }),

  removeTrip: (code) =>
    set((s) => ({
      trips: s.trips.filter((t) => t.feature_code !== code),
      colorMap: Object.fromEntries(
        Object.entries(s.colorMap).filter(([k]) => k !== code)
      ),
    })),
}));
