import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

import { authenticate } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/auth-cookies.js";
import { authService } from "./auth.service.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema
} from "./auth.validation.js";

const router = Router();

function parseBody<T>(schema: { parse: (value: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = Object.values(error.flatten().fieldErrors).flat()[0] as string | undefined;
      throw new ApiError(400, firstError || "Validation failed");
    }

    throw error;
  }
}

router.post("/register/client", catchAsync(async (request, response) => {
  const payload = parseBody(registerSchema, request.body);
  const result = await authService.register({
    role: "CLIENT",
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    governorate: payload.governorate,
    city: payload.city,
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude
  });

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/register/worker", catchAsync(async (request, response) => {
  const payload = parseBody(registerSchema, request.body);
  const result = await authService.register({
    role: "WORKER",
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    governorate: payload.governorate,
    city: payload.city,
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    nationalIdNumber: payload.nationalIdNumber,
    nationalIdFront: payload.nationalIdFront,
    nationalIdBack: payload.nationalIdBack
  });

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/register/vendor", catchAsync(async (request, response) => {
  const payload = parseBody(registerSchema, request.body);
  const result = await authService.register({
    role: "VENDOR",
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    governorate: payload.governorate,
    city: payload.city,
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    shopName: (payload as any).shopName || (payload as any).storeName,
    category: (payload as any).category
  });

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/login", catchAsync(async (request, response) => {
  const payload = parseBody(loginSchema, request.body);
  const result = await authService.login({
    phone: payload.phone,
    password: payload.password
  });

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(200).json(
    successResponse(result, "Logged in")
  );
}));

router.post("/verify-otp", catchAsync(async (request, response) => {
  const payload = parseBody(verifyOtpSchema, request.body);
  const result = await authService.verifyOtp(payload.phone);

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(200).json(successResponse(result, "OTP verified"));
}));

router.post("/refresh-token", catchAsync(async (request, response) => {
  const cookieRefreshToken = request.cookies?.osta_refresh_token;
  const payload = parseBody(refreshTokenSchema, {
    refreshToken: typeof cookieRefreshToken === "string" ? cookieRefreshToken : request.body?.refreshToken
  });
  const result = await authService.refresh(payload.refreshToken);

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.role
  });

  response.status(200).json(successResponse(result, "Tokens refreshed"));
}));

router.post("/forgot-password", (request, response) => {
  parseBody(forgotPasswordSchema, request.body);
  response.status(200).json(successResponse({ sent: true }, "OTP sent"));
});

router.post("/reset-password", (request, response) => {
  parseBody(resetPasswordSchema, request.body);
  response.status(200).json(successResponse({ reset: true }, "Password reset successful"));
});

router.post("/logout", authenticate, catchAsync(async (request, response) => {
  clearAuthCookies(response);
  response.status(200).json(successResponse(await authService.logout(request.auth!.sessionId), "Logged out"));
}));

router.get("/me", authenticate, catchAsync(async (request, response) => {
  response.status(200).json(successResponse(await authService.me(request.auth!.userId), "Authenticated user"));
}));

export const authRouter = router;
