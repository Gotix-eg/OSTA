export type AuthRole = "CLIENT" | "WORKER" | "ADMIN" | "SUPER_ADMIN";

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
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem("osta_user_role", payload.role);
    storage.setItem("osta_user_name", payload.firstName ?? "");
  } catch {
    // Ignore storage failures.
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.removeItem("osta_user_role");
      storage.removeItem("osta_user_name");
    } catch {
      // Ignore storage failures.
    }
  }
}

export function getDashboardRoute(locale: string, role: AuthRole) {
  if (role === "CLIENT") {
    return `/${locale}/client`;
  }

  if (role === "WORKER") {
    return `/${locale}/worker`;
  }

  return `/${locale}/admin`;
}
