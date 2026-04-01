import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/tokens.js";

function getToken(request: Request) {
  const authHeader = request.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieToken = request.cookies?.osta_access_token;
  return typeof cookieToken === "string" ? cookieToken : undefined;
}

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const token = getToken(request);

  if (!token) {
    next(new ApiError(401, "Authentication required", "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role as UserRole
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth) {
      next(new ApiError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(request.auth.role)) {
      next(new ApiError(403, "You do not have access to this resource", "FORBIDDEN"));
      return;
    }

    next();
  };
}
