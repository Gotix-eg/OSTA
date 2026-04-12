export type AuthRole = "CLIENT" | "WORKER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

type AuthSessionPayload = {
  accessToken: string;
  refreshToken: string;
  role: AuthRole;
  firstName?: string;
};

export function saveAuthSession(payload: AuthSessionPayload, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // 1. Save to Storage for immediate UI updates
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem("osta_user_role", payload.role);
    storage.setItem("osta_user_name", payload.firstName ?? "");
    storage.setItem("osta_access_token", payload.accessToken);

    // 2. Set Cookies for Middleware (most important for redirects)
    const expiry = remember ? "; max-age=31536000" : ""; // 1 year or session
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const path = "; path=/";

    document.cookie = `osta_access_token=${payload.accessToken}${expiry}${path}${secure}; SameSite=Lax`;
    document.cookie = `osta_user_role=${payload.role}${expiry}${path}${secure}; SameSite=Lax`;
  } catch (err) {
    console.error("Failed to save auth session", err);
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  // 1. Clear Storage
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.removeItem("osta_user_role");
      storage.removeItem("osta_user_name");
      storage.removeItem("osta_access_token");
    } catch {}
  }

  // 2. Clear Cookies
  const path = "; path=/";
  document.cookie = `osta_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC${path}`;
  document.cookie = `osta_user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC${path}`;
}

export function getDashboardRoute(locale: string, role: AuthRole) {
  if (role === "CLIENT") {
    return `/${locale}/client`;
  }

  if (role === "WORKER") {
    return `/${locale}/worker`;
  }

  if (role === "VENDOR") {
    return `/${locale}/vendor`;
  }

  return `/${locale}/admin`;
}
