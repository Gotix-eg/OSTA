import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

import type { ApiEnvelope, AuthPayload } from "../types/auth";
import { deleteStorageItem, getStorageItem, setStorageItem } from "../utils/storage";

const ACCESS_TOKEN_KEY = "osta_access_token";
const REFRESH_TOKEN_KEY = "osta_refresh_token";
const ROLE_KEY = "osta_role";

const productionApiUrl = "https://www.ostafy.com/api";
const localApiUrl = Platform.select({
  android: "http://10.0.2.2:4000/api",
  default: "http://localhost:4000/api"
});

const configuredApiUrl = process.env.EXPO_PUBLIC_OSTA_API_URL;

// During development, we connect to the local server (which connects to the online database) to bypass browser CORS restrictions.
export const API_BASE_URL = configuredApiUrl ?? (__DEV__ ? localApiUrl : productionApiUrl);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export async function getStoredAccessToken() {
  return getStorageItem(ACCESS_TOKEN_KEY);
}

export async function getStoredRefreshToken() {
  return getStorageItem(REFRESH_TOKEN_KEY);
}

export async function setAuthTokens(payload: AuthPayload) {
  await setStorageItem(ACCESS_TOKEN_KEY, payload.accessToken);
  await setStorageItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  const role = payload.user?.role ?? payload.role;
  if (role) {
    await setStorageItem(ROLE_KEY, role);
  }
}

export async function clearAuthTokens() {
  await Promise.all([
    deleteStorageItem(ACCESS_TOKEN_KEY),
    deleteStorageItem(REFRESH_TOKEN_KEY),
    deleteStorageItem(ROLE_KEY)
  ]);
}

function extractErrorMessage(error: AxiosError<ApiEnvelope<unknown>>) {
  const payload = error.response?.data;
  if (!payload) {
    return error.message;
  }
  if (typeof payload.error === "string") {
    return payload.error;
  }
  if (typeof payload.error?.message === "string") {
    return payload.error.message;
  }
  return payload.message ?? error.message;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(new Error(extractErrorMessage(error)));
    }

    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      await clearAuthTokens();
      return Promise.reject(new Error(extractErrorMessage(error)));
    }

    originalRequest._retry = true;
    try {
      const response = await axios.post<ApiEnvelope<AuthPayload>>(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken
      });
      if (!response.data.success || !response.data.data?.accessToken) {
        throw new Error(response.data.message ?? "Unable to refresh session");
      }
      await setAuthTokens({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        role: response.data.data.role
      });
      originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearAuthTokens();
      return Promise.reject(refreshError);
    }
  }
);

export function unwrapApiData<T>(payload: ApiEnvelope<T>): T {
  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? "API request failed");
  }
  return payload.data;
}
