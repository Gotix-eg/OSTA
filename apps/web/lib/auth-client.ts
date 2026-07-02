import { fetchApiData } from "@/lib/api";
import type { AuthRole } from "@/lib/auth-session";

type AuthMeResponse =
  | {
      user?: {
        id?: string;
        role?: AuthRole;
      };
      id?: string;
      role?: AuthRole;
    }
  | null;

export async function getBrowserAuthState() {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, role: null as AuthRole | null };
  }

  const data = await fetchApiData<AuthMeResponse>("/auth/me", null);
  const user = data?.user ?? data;

  return {
    isLoggedIn: Boolean(user?.id),
    role: user?.role ?? null,
  };
}
