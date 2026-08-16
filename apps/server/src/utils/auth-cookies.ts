import type { Response } from "express";

function shouldUseSecureCookies() {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (process.env.VERCEL === "1") {
    return true;
  }

  return (process.env.APP_URL ?? "").startsWith("https://");
}

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
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  response.cookie("osta_refresh_token", payload.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  response.cookie("osta_user_role", payload.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(response: Response) {
  for (const name of ["osta_access_token", "osta_refresh_token", "osta_user_role"]) {
    response.clearCookie(name, {
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureCookies(),
      path: "/"
    });
  }
}
