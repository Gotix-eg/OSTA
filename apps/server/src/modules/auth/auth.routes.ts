import { Router, Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

import { authenticate } from "../../middleware/auth.middleware.js";
import {
  authLimiter,
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
  registrationLimiter
} from "../../middleware/rate-limit.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/auth-cookies.js";
import { verifyAccessToken } from "../../utils/tokens.js";
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

router.use(authLimiter);

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

function getAccessToken(request: Request) {
  const authHeader = request.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieToken = request.cookies?.osta_access_token;
  return typeof cookieToken === "string" ? cookieToken : undefined;
}

router.post("/register/client", registrationLimiter, catchAsync(async (request, response) => {
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

  if ("needsVerification" in result) {
    response.status(200).json(
      successResponse(result, "Verification code sent to email")
    );
    return;
  }

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/verify-registration-otp", otpLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام")
  }), request.body);

  const result = await authService.verifyRegistrationOtp(payload.email, payload.code);

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(200).json(
    successResponse(result, "Email verified and profile activated")
  );
}));

router.post("/register/worker", registrationLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(registerSchema, request.body);
  const result = (await authService.register({
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
    nationalIdBack: payload.nationalIdBack,
    profession: payload.profession
  })) as any;

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/register/vendor", registrationLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(registerSchema, request.body);
  const result = (await authService.register({
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
    category: (payload as any).category,
    commercialRecord: payload.commercialRecord,
    taxCard: payload.taxCard
  })) as any;

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "Account created")
  );
}));

router.post("/login", loginLimiter, catchAsync(async (request, response) => {
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

router.post("/verify-otp", otpLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(verifyOtpSchema, request.body);
  const result = await authService.verifyOtp(payload.phone, payload.code, payload.type);

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

router.post("/forgot-password", passwordResetLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(forgotPasswordSchema, request.body);
  const result = await authService.forgotPassword(payload.email);
  response.status(200).json(successResponse(result, "Reset code sent to your email"));
}));

router.post("/reset-password", passwordResetLimiter, catchAsync(async (request, response) => {
  const payload = parseBody(resetPasswordSchema, request.body);
  const result = await authService.resetPassword(payload.email, payload.code, payload.password);
  response.status(200).json(successResponse(result, "Password reset successful"));
}));

router.post("/logout", catchAsync(async (request, response) => {
  clearAuthCookies(response);

  const token = getAccessToken(request);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      await authService.logout(payload.sessionId);
    } catch {
      // Cookies are cleared regardless; invalid/expired tokens should still log out locally.
    }
  }

  response.status(200).json(successResponse({ cleared: true }, "Logged out"));
}));

router.get("/me", authenticate, catchAsync(async (request, response) => {
  response.status(200).json(successResponse(await authService.me(request.auth!.userId), "Authenticated user"));
}));

export const authRouter = router;
