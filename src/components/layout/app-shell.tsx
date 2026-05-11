"use client";

import { useEffect } from "react";
import { MapContainer } from "@/components/map/map-container";
import { Sidebar } from "@/components/layout/sidebar";
import { useAppStore } from "@/stores/app-store";
import { loadColorMap, loadAllTrips } from "@/lib/db";

export function AppShell() {
  const loadColorMapStore = useAppStore((s) => s.loadColorMap);
  const setTrips = useAppStore((s) => s.setTrips);

  // Bootstrap: load saved data from Supabase on first render
  useEffect(() => {
    Promise.all([loadColorMap(), loadAllTrips()])
      .then(([colorMap, trips]) => {
        loadColorMapStore(colorMap);
        setTrips(trips);
      })
      .catch(console.error);
  }, [loadColorMapStore, setTrips]);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapContainer />
      </main>
    </div>
  );
}
