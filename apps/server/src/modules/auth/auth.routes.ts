import { Router, Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

import { authenticate, getToken } from "../../middleware/auth.middleware.js";
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
import { prisma } from "../../lib/prisma.js";
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
    longitude: payload.longitude,
    avatarUrl: payload.avatarUrl
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
    profession: payload.profession,
    avatarUrl: payload.avatarUrl
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

router.get("/me", catchAsync(async (request, response) => {
  const token = getToken(request);

  if (!token) {
    response.status(200).json(successResponse(null, "Not authenticated"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    response.status(200).json(successResponse(await authService.me(payload.sub), "Authenticated user"));
  } catch {
    response.status(200).json(successResponse(null, "Not authenticated"));
  }
}));

router.patch("/profile", authenticate, catchAsync(async (request, response) => {
  const { firstName, lastName, email, avatarUrl, profession, bio, areas, shopName, shopDescription, category, address, nationalIdNumber, nationalIdFront, nationalIdBack } = request.body;
  const userId = request.auth!.userId;

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  const isNewEmail = email !== undefined && email?.trim().toLowerCase() !== existingUser?.email?.trim().toLowerCase();

  if (profession !== undefined || bio !== undefined || nationalIdNumber !== undefined || nationalIdFront !== undefined || nationalIdBack !== undefined) {
    const currentWorker = await prisma.workerProfile.findUnique({ where: { userId } });
    const isPending = currentWorker?.verificationStatus === "PENDING";
    const allDocsProvided = (nationalIdNumber || currentWorker?.nationalIdNumber) && (nationalIdFront || currentWorker?.nationalIdFront) && (nationalIdBack || currentWorker?.nationalIdBack) && (avatarUrl || existingUser?.avatarUrl);

    await prisma.workerProfile.updateMany({
      where: { userId },
      data: {
        ...(profession !== undefined ? { profession } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(nationalIdNumber !== undefined ? { nationalIdNumber } : {}),
        ...(nationalIdFront !== undefined ? { nationalIdFront } : {}),
        ...(nationalIdBack !== undefined ? { nationalIdBack } : {}),
        ...(isPending && allDocsProvided ? { verificationStatus: "DOCUMENTS_SUBMITTED" } : {})
      }
    });
  }

  if (shopName !== undefined || shopDescription !== undefined || category !== undefined || address !== undefined) {
    await prisma.vendorProfile.updateMany({
      where: { userId },
      data: {
        ...(shopName !== undefined ? { shopName } : {}),
        ...(shopDescription !== undefined ? { shopDescription } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(address !== undefined ? { address } : {})
      }
    });
  }

  if (areas !== undefined && Array.isArray(areas)) {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId }
    });
    if (workerProfile) {
      await prisma.workerArea.deleteMany({
        where: { workerId: workerProfile.id }
      });
      for (const areaName of areas) {
        if (typeof areaName === "string" && areaName.trim()) {
          await prisma.workerArea.create({
            data: {
              workerId: workerProfile.id,
              governorate: "cairo",
              city: areaName.trim(),
              area: areaName.trim()
            }
          });
        }
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName !== undefined ? firstName : undefined,
      lastName: lastName !== undefined ? lastName : undefined,
      email: email !== undefined ? email : undefined,
      emailVerified: isNewEmail ? false : undefined,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
    },
    select: {
      id: true,
      role: true,
      phone: true,
      email: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      status: true
    }
  });

  response.status(200).json(
    successResponse({ user: updatedUser }, "Profile updated successfully")
  );
}));

router.post("/send-email-verification", authenticate, catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const { email } = request.body as { email?: string };
  const result = await authService.sendEmailVerification(userId, email);
  response.status(200).json(successResponse(result, result.message));
}));

router.post("/verify-email-otp", authenticate, catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const { code } = request.body as { code: string };
  const result = await authService.verifyEmailOtp(userId, code);
  response.status(200).json(successResponse(result, result.message));
}));

router.post("/switch-role", authenticate, catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const { targetRole: bodyTargetRole } = request.body as { targetRole?: string };
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: true,
      workerProfile: true,
      vendorProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let targetRole: "CLIENT" | "WORKER" | "VENDOR";
  if (bodyTargetRole) {
    if (!["CLIENT", "WORKER", "VENDOR"].includes(bodyTargetRole)) {
      throw new ApiError(400, "Invalid target role");
    }
    targetRole = bodyTargetRole as "CLIENT" | "WORKER" | "VENDOR";
  } else {
    // Default fallback toggle logic
    if (user.role === "WORKER") {
      targetRole = "CLIENT";
    } else if (user.role === "VENDOR") {
      targetRole = "CLIENT";
    } else {
      // Current is CLIENT: check if they have a worker profile first, then vendor, default to worker
      if (user.workerProfile) {
        targetRole = "WORKER";
      } else if (user.vendorProfile) {
        targetRole = "VENDOR";
      } else {
        targetRole = "WORKER"; // will throw correct message below
      }
    }
  }

  // Ensure target profile exists
  if (targetRole === "CLIENT" && !user.clientProfile) {
    throw new ApiError(400, "يجب التسجيل كعميل أولاً لتفعيل وضع العميل");
  } else if (targetRole === "WORKER" && !user.workerProfile) {
    throw new ApiError(400, "يجب التسجيل كفني أولاً وتوثيق المستندات لتفعيل وضع الفني");
  } else if (targetRole === "VENDOR" && !user.vendorProfile) {
    throw new ApiError(400, "يجب التسجيل كمورد أولاً وتوثيق المستندات لتفعيل وضع المورد");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: targetRole },
    select: {
      id: true,
      role: true,
      phone: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      status: true
    }
  });

  const tokens = await authService.switchRoleSession(userId, targetRole);

  setAuthCookies(response, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    role: targetRole
  });

  response.status(200).json(
    successResponse({ 
      user: updatedUser, 
      role: targetRole,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }, "Role switched successfully")
  );
}));

router.post("/stop-impersonation", catchAsync(async (request: Request, response: Response) => {
  const adminToken = request.cookies?.osta_admin_backup_token;
  if (!adminToken) {
    throw new ApiError(400, "No active impersonation session found");
  }

  response.cookie("osta_access_token", adminToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  response.cookie("osta_user_role", "ADMIN", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  response.clearCookie("osta_admin_backup_token", { path: "/" });
  response.clearCookie("osta_impersonating_name", { path: "/" });

  response.status(200).json(successResponse({ redirectUrl: "/admin/workers" }, "Impersonation ended successfully"));
}));

export const authRouter = router;
