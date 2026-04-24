interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    // In browser, use the public API URL or a relative proxy path
    return process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api";
  }
  // On server, prioritize the internal API URL, then the public one
  return process.env.OSTA_API_URL ?? process.env.NEXT_PUBLIC_OSTA_API_URL ?? "http://localhost:4000/api";
}

export function resolveApiBaseUrl() {
  return getApiBaseUrl();
}

export async function fetchApiData<T>(path: string, fallback: T): Promise<T> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json"
    };

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Server side: get token from cookies
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("osta_access_token")?.value;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
      credentials: "include",
      headers,
      signal: AbortSignal.timeout(3500)
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const payload = (await response.json()) as ApiEnvelope<T>;

    if (!payload.success || payload.data === undefined) {
      throw new Error(payload.error ?? "Missing data payload");
    }

    return payload.data;
  } catch {
    return fallback;
  }
}

export async function postApiData<TResponse, TBody>(path: string, body: TBody) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: typeof window !== "undefined" ? `Bearer ${window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || ""}` : ""
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}

export async function patchApiData<TResponse, TBody>(path: string, body?: TBody) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: typeof window !== "undefined" ? `Bearer ${window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || ""}` : ""
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}
