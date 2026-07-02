export type AuthRole = "CLIENT" | "WORKER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

type AuthSessionPayload = {
  accessToken: string;
  refreshToken: string;
  role: AuthRole;
  firstName?: string;
};

export function saveAuthSession(_payload: AuthSessionPayload, _remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  clearLegacyClientAuthStorage();
}

function clearLegacyClientAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.removeItem("osta_user_role");
      storage.removeItem("osta_user_name");
      storage.removeItem("osta_access_token");
    } catch {}
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  clearLegacyClientAuthStorage();

  const path = "; path=/";
  document.cookie = `osta_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC${path}`;
  document.cookie = `osta_user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC${path}`;
  document.cookie = `osta_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC${path}`;
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
