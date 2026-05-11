"use client";

import { useAppStore } from "@/stores/app-store";
import { deleteTrip, loadAllTrips } from "@/lib/db";
import { exportTripsAsCSV } from "@/lib/backup";
import type { Level } from "admdongkor";
import type { Trip } from "@/lib/db";

const LEVELS: { key: Level; label: string }[] = [
  { key: "sido", label: "시도" },
  { key: "sgg", label: "시군구" },
  { key: "emd", label: "읍면동" },
];

function TripCard({ trip }: { trip: Trip }) {
  const removeTrip = useAppStore((s) => s.removeTrip);

  const handleDelete = async () => {
    removeTrip(trip.feature_code);
    await deleteTrip(trip.feature_code).catch(console.error);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* Color stamp */}
      <div
        style={{
          width: 12,
          height: 24,
          borderRadius: 1,
          background: trip.color,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {trip.feature_name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--ink-faint)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {trip.feature_code}
        </div>
      </div>
      <button
        onClick={handleDelete}
        title="삭제"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ink-faint)",
          fontSize: 14,
          padding: "2px 4px",
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLButtonElement).style.color = "var(--accent)")
        }
        onMouseLeave={(e) =>
          ((e.target as HTMLButtonElement).style.color = "var(--ink-faint)")
        }
      >
        ×
      </button>
    </div>
  );
}

export function Sidebar() {
  const level = useAppStore((s) => s.level);
  const setLevel = useAppStore((s) => s.setLevel);
  const trips = useAppStore((s) => s.trips);

  const handleDownload = async () => {
    const all = await loadAllTrips();
    exportTripsAsCSV(all);
  };

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          여행 기록
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-faint)",
            fontFamily: "var(--font-mono)",
            marginTop: 3,
          }}
        >
          {trips.length}개 지역 방문
        </div>
      </div>

      {/* Level toggle */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--ink-faint)",
            fontFamily: "var(--font-mono)",
            marginBottom: 6,
            letterSpacing: "0.06em",
          }}
        >
          행정 단위
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {LEVELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLevel(key)}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 12,
                border: "1px solid",
                borderColor: level === key ? "var(--accent)" : "var(--border)",
                background: level === key ? "var(--accent)" : "var(--surface)",
                color: level === key ? "#fff" : "var(--ink-muted)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trip list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {trips.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--ink-faint)",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            지도에서 지역을 클릭하면
            <br />
            기록이 저장됩니다
          </div>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.feature_code} trip={trip} />
          ))
        )}
      </div>

      {/* Footer: CSV download */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          onClick={handleDownload}
          disabled={trips.length === 0}
          style={{
            width: "100%",
            padding: "8px 0",
            fontSize: 12,
            fontFamily: "var(--font-display)",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            color: trips.length === 0 ? "var(--ink-faint)" : "var(--ink)",
            cursor: trips.length === 0 ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (trips.length > 0)
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--border-strong)";
          }}
        >
          CSV 다운로드
        </button>
      </div>
    </aside>
  );
}
