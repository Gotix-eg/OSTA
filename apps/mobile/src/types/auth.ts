export type UserRole = "CLIENT" | "WORKER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

export type PublicUser = {
  id: string;
  role: UserRole;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  status?: string;
  profile?: Record<string, unknown> | null;
  avatarUrl?: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  expiresAt?: string;
  role?: UserRole;
  user?: PublicUser;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | { message?: string; code?: string };
};

export type RegisterPayload = {
  role: Extract<UserRole, "CLIENT" | "WORKER" | "VENDOR">;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  governorate?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  shopName?: string;
  nationalIdNumber?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  commercialRecord?: string;
  taxCard?: string;
  profession?: string;
  avatarUrl?: string;
};
