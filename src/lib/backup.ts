import type { Trip } from "./db";

/** Downloads all trips as a UTF-8 CSV with BOM (Korean Excel compatible). */
export function exportTripsAsCSV(trips: Trip[]) {
  const headers = [
    "지역코드",
    "지역명",
    "행정단위",
    "색상",
    "메모",
    "방문일",
    "기록일시",
  ];

  const levelLabel: Record<string, string> = {
    emd: "읍면동",
    sgg: "시군구",
    sido: "시도",
  };

  const rows = trips.map((t) =>
    [
      t.feature_code,
      t.feature_name,
      levelLabel[t.level] ?? t.level,
      t.color,
      t.note ?? "",
      t.visited_at ?? "",
      t.created_at ? new Date(t.created_at).toLocaleString("ko-KR") : "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  // \uFEFF = BOM — makes Excel open Korean text correctly without re-encoding
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `여행기록_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
