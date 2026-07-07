import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient, unwrapApiData } from "../api/client";

export function useApiResource<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable ref to fallback to avoid infinite loops when literals are passed
  const fallbackRef = useRef(fallback);
  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const reload = useCallback(async () => {
    if (!path) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(path);
      const unpacked = unwrapApiData<T>(response.data);
      if (unpacked === null || unpacked === undefined) {
        setData(fallbackRef.current);
      } else if (Array.isArray(fallbackRef.current) && !Array.isArray(unpacked)) {
        setData(fallbackRef.current);
      } else {
        setData(unpacked);
      }
    } catch (requestError) {
      setData(fallbackRef.current);
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, error, reload };
}
