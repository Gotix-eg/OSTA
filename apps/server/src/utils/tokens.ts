import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

type AccessPayload = {
  sub: string;
  role: string;
  sessionId: string;
};

type RefreshPayload = {
  sub: string;
  sessionId: string;
  type: "refresh";
};

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function signRefreshToken(payload: RefreshPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessPayload & jwt.JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload & jwt.JwtPayload;
}
