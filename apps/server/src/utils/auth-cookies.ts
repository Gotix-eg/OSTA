import type { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: Response,
  payload: {
    accessToken: string;
    refreshToken: string;
    role: string;
  }
) {
  response.cookie("osta_access_token", payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  response.cookie("osta_refresh_token", payload.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  response.cookie("osta_user_role", payload.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(response: Response) {
  for (const name of ["osta_access_token", "osta_refresh_token", "osta_user_role"]) {
    response.clearCookie(name, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/"
    });
  }
}
