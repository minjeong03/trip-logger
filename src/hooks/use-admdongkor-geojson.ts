"use client";

import { useEffect, useState } from "react";
import { get, VERSIONS } from "admdongkor";
import type { AdmFeatureCollection, Level } from "admdongkor";

// Always use the latest boundary version
const LATEST = VERSIONS[VERSIONS.length - 1];

// Module-level cache — survives re-renders, lost only on full page reload
const cache = new Map<string, Promise<AdmFeatureCollection>>();

function cacheKey(level: Level) {
  return `${level}|${LATEST}|light`;
}

export function useAdmdongkorGeoJSON(level: Level): {
  data: AdmFeatureCollection | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<AdmFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const key = cacheKey(level);
    let p = cache.get(key);
    if (!p) {
      p = get(LATEST, level, { detail: false });
      cache.set(key, p);
    }

    p.then(
      (fc) => {
        if (!cancelled) {
          setData(fc);
          setLoading(false);
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          cache.delete(key); // remove failed promise so it can retry
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    );

    return () => { cancelled = true; };
  }, [level]);

  return { data, loading, error };
}
