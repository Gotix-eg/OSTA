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

async function getServerAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    return {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("osta_access_token")?.value;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApiData<T>(path: string, fallback: T): Promise<T> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(await getServerAuthHeaders())
    };

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      next: { revalidate: 60 },
      credentials: "include",
      headers,
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.error("API GET request failed:", { path, status: response.status });
      throw new Error(`Request failed with ${response.status}`);
    }

    const payload = (await response.json()) as ApiEnvelope<T>;

    if (!payload.success || payload.data === undefined) {
      console.error("API GET payload failed:", { path, payload });
      throw new Error(payload.error ?? payload.message ?? "Missing data payload");
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
      ...(await getServerAuthHeaders())
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    console.error("API POST request failed:", { path, status: response.status, payload });
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
      ...(await getServerAuthHeaders())
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    console.error("API PATCH request failed:", { path, status: response.status, payload });
    throw new Error(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}

export async function deleteApiData<TResponse>(path: string) {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(await getServerAuthHeaders())
    }
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success) {
    console.error("API DELETE request failed:", { path, status: response.status, payload });
    throw new Error(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}

export async function putApiData<TResponse, TBody>(path: string, body?: TBody) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(await getServerAuthHeaders())
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = (await response.json()) as ApiEnvelope<TResponse>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? payload.message ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}
