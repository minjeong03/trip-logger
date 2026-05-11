"use client";

import { useMemo } from "react";
import { Map, NavigationControl } from "react-map-gl/maplibre";
import { GeoJsonLayer } from "@deck.gl/layers";
import { DeckOverlay } from "./deck-overlay";
import { useAdmdongkorGeoJSON } from "@/hooks/use-admdongkor-geojson";
import { useAppStore } from "@/stores/app-store";
import { saveTrip } from "@/lib/db";

// Stamp-like color palette — matches CSS variables in globals.css
const STAMP_COLORS = [
  "#c0392b", // 빨강
  "#2471a3", // 파랑
  "#1e8449", // 초록
  "#d35400", // 주황
  "#7d3c98", // 보라
  "#1a5276", // 남색
];

/** Convert hex string to [r, g, b] array for deck.gl */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** Pick next color in rotation based on how many trips already exist */
function pickNextColor(count: number): string {
  return STAMP_COLORS[count % STAMP_COLORS.length];
}

/** Extract the region code from feature properties based on level */
function getCode(
  props: Record<string, unknown>,
  level: string
): string | null {
  if (level === "emd") return (props.emdcd as string) ?? null;
  if (level === "sgg") return (props.sggcd as string) ?? null;
  if (level === "sido") return (props.sidocd as string) ?? null;
  return null;
}

/** Extract the region name from feature properties based on level */
function getName(props: Record<string, unknown>, level: string): string {
  if (level === "emd") return (props.emdnm as string) ?? "";
  if (level === "sgg") return (props.sggnm as string) ?? "";
  if (level === "sido") return (props.sidonm as string) ?? "";
  return "";
}

export function MapContainer() {
  const level = useAppStore((s) => s.level);
  const colorMap = useAppStore((s) => s.colorMap);
  const trips = useAppStore((s) => s.trips);
  const setColor = useAppStore((s) => s.setColor);
  const addOrUpdateTrip = useAppStore((s) => s.addOrUpdateTrip);

  const { data: geojson, loading } = useAdmdongkorGeoJSON(level);

  const layer = useMemo(() => {
    if (!geojson) return null;

    return new GeoJsonLayer({
      id: `adm-${level}`,
      data: geojson,
      filled: true,
      stroked: true,

      getFillColor: (f) => {
        const props = f.properties as Record<string, unknown>;
        const code = getCode(props, level);
        if (!code || !colorMap[code]) return [180, 170, 155, 40]; // unvisited
        const [r, g, b] = hexToRgb(colorMap[code]);
        return [r, g, b, 160];
      },

      getLineColor: (f) => {
        const props = f.properties as Record<string, unknown>;
        const code = getCode(props, level);
        if (!code || !colorMap[code]) return [140, 120, 90, 120];
        const [r, g, b] = hexToRgb(colorMap[code]);
        return [r, g, b, 220];
      },

      lineWidthMinPixels: 1,
      pickable: true,
      autoHighlight: true,
      highlightColor: [200, 180, 140, 60],

      updateTriggers: {
        getFillColor: colorMap,
        getLineColor: colorMap,
      },

      onClick: ({ object }) => {
        if (!object) return;
        const props = object.properties as Record<string, unknown>;
        const code = getCode(props, level);
        const name = getName(props, level);
        if (!code) return;

        // If already visited, clicking again cycles to next color
        const currentColor = colorMap[code];
        const currentIdx = currentColor
          ? STAMP_COLORS.indexOf(currentColor)
          : -1;
        const nextColor =
          currentIdx >= 0
            ? STAMP_COLORS[(currentIdx + 1) % STAMP_COLORS.length]
            : pickNextColor(trips.length);

        const trip = {
          feature_code: code,
          feature_name: name,
          level,
          color: nextColor,
        };

        // Optimistic update — UI responds immediately
        setColor(code, nextColor);
        addOrUpdateTrip(trip);

        // Persist to Supabase in background
        saveTrip(trip).catch(console.error);
      },
    });
  }, [geojson, colorMap, level, trips.length, setColor, addOrUpdateTrip]);

  return (
    <div className="relative w-full h-full">
      <Map
        initialViewState={{
          longitude: 127.8,
          latitude: 36.0,
          zoom: 6.8,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />
        <DeckOverlay layers={layer ? [layer] : []} />
      </Map>

      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 20px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-muted)",
            boxShadow: "var(--shadow)",
            pointerEvents: "none",
          }}
        >
          지도 불러오는 중…
        </div>
      )}
    </div>
  );
}
