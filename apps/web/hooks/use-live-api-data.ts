"use client";

import { useEffect, useState } from "react";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

function getPublicApiBaseUrl() {
  return process.env.NEXT_PUBLIC_OSTA_API_URL ?? "http://localhost:4000/api";
}

export function useLiveApiData<T>(path: string, initialData: T) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
        
        const response = await fetch(`${getPublicApiBaseUrl()}${path}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
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
