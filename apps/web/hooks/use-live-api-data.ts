"use client";

import { useEffect, useState } from "react";

import { resolveApiBaseUrl } from "@/lib/api";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

export function useLiveApiData<T>(path: string, initialData: T) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
          credentials: "include",
          cache: "no-store",
          headers: {
            "Accept": "application/json"
          },
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as ApiEnvelope<T>;

        if (payload.success && payload.data !== undefined) {
          setData(payload.data);
        }
      } catch {}
    }

    void load();

    return () => controller.abort();
  }, [path]);

  return data;
}
