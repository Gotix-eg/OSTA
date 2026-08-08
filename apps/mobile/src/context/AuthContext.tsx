import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiClient, clearAuthTokens, getStoredAccessToken, setAuthTokens, unwrapApiData } from "../api/client";
import type { AuthPayload, PublicUser, RegisterPayload, UserRole } from "../types/auth";

type AuthContextValue = {
  user: PublicUser | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<PublicUser>;
  register: (payload: RegisterPayload) => Promise<{ authenticated: boolean; needsVerification: boolean }>;
  verifyOtp: (code: string, phone?: string, type?: "registration" | "login" | "reset") => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (targetRole?: "CLIENT" | "WORKER" | "VENDOR") => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthPayload = useCallback(async (payload: AuthPayload) => {
    await setAuthTokens(payload);
    setToken(payload.accessToken);
    setUser(payload.user ?? null);
    setRole(payload.user?.role ?? payload.role ?? null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = await getStoredAccessToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const response = await apiClient.get("/auth/me");
      const data = unwrapApiData<{ user: PublicUser }>(response.data);
      setUser(data.user);
      setRole(data.user.role);
    } catch {
      await clearAuthTokens();
      setToken(null);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (phone: string, password: string) => {
    const response = await apiClient.post("/auth/login", { phone, password });
    const data = unwrapApiData<AuthPayload>(response.data);
    if (!data.user) {
      throw new Error("Login response did not include a user");
    }
    await applyAuthPayload(data);
    return data.user;
  }, [applyAuthPayload]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const endpoint = `/auth/register/${payload.role.toLowerCase()}`;
    const response = await apiClient.post(endpoint, payload);
    const data = unwrapApiData<AuthPayload & { needsVerification?: boolean }>(response.data);
    setPendingPhone(payload.phone);
    if (data.accessToken && data.refreshToken) {
      await applyAuthPayload(data);
      return { authenticated: true, needsVerification: false };
    }
    return { authenticated: false, needsVerification: Boolean(data.needsVerification) };
  }, [applyAuthPayload]);

  const verifyOtp = useCallback(async (
    code: string,
    phone = pendingPhone ?? "",
    type: "registration" | "login" | "reset" = "registration"
  ) => {
    const response = await apiClient.post("/auth/verify-otp", { phone, code, type });
    const data = unwrapApiData<AuthPayload>(response.data);
    if (!data.user) {
      throw new Error("OTP response did not include a user");
    }
    await applyAuthPayload(data);
    return data.user;
  }, [applyAuthPayload, pendingPhone]);

  const logout = useCallback(async () => {
    try {
      // Remove push token from server first so no more push notifications after logout
      await apiClient.delete("/notifications/push-token").catch(() => {});
      await apiClient.post("/auth/logout");
    } finally {
      await clearAuthTokens();
      setToken(null);
      setUser(null);
      setRole(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      const data = unwrapApiData<{ user: PublicUser }>(response.data);
      setUser(data.user);
      setRole(data.user.role);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  }, []);

  const switchRole = useCallback(async (targetRole?: "CLIENT" | "WORKER" | "VENDOR") => {
    const response = await apiClient.post("/auth/switch-role", { targetRole });
    const data = unwrapApiData<AuthPayload>(response.data);
    await applyAuthPayload(data);
  }, [applyAuthPayload]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    role,
    isLoading,
    login,
    register,
    verifyOtp,
    logout,
    refreshUser,
    switchRole
  }), [isLoading, login, logout, register, role, token, user, verifyOtp, refreshUser, switchRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
