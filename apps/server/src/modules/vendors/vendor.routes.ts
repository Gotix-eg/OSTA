import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { setAuthCookies } from "../../utils/auth-cookies.js";
import { vendorService } from "./vendor.service.js";
import {
  registerVendorSchema,
  updateVendorProfileSchema,
  updateVendorLocationSchema,
  updateVendorStatusSchema,
} from "./vendor.validation.js";

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

function parseBody<T>(schema: { parse: (value: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = Object.values(error.flatten().fieldErrors).flat()[0] as string | undefined;
      throw new ApiError(400, firstError || "بيانات غير صالحة");
    }
    throw error;
  }
}

const router = Router();

// POST /api/vendors/register - Register as vendor
router.post("/register", catchAsync(async (request, response) => {
  const payload = parseBody(registerVendorSchema, request.body);
  const result = await vendorService.register(payload);

  setAuthCookies(response, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    role: result.user.role
  });

  response.status(201).json(
    successResponse(result, "تم إنشاء حساب المحل بنجاح")
  );
}));

// GET /api/vendors/profile - Get vendor profile
router.get("/profile", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const result = await vendorService.getProfile(request.auth!.userId);
  response.json(successResponse(result, "بيانات المحل"));
}));

// PUT /api/vendors/profile - Update vendor profile
router.put("/profile", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorProfileSchema, request.body);
  const result = await vendorService.updateProfile(request.auth!.userId, payload);
  response.json(successResponse(result, "تم تحديث بيانات المحل"));
}));

// PUT /api/vendors/location - Update vendor location
router.put("/location", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorLocationSchema, request.body);
  const result = await vendorService.updateLocation(request.auth!.userId, payload.latitude, payload.longitude);
  response.json(successResponse(result, "تم تحديث الموقع"));
}));

// PUT /api/vendors/status - Toggle open/closed
router.put("/status", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorStatusSchema, request.body);
  const result = await vendorService.updateStatus(request.auth!.userId, payload.isOpen);
  response.json(successResponse(result, payload.isOpen ? "المحل مفتوح" : "المحل مغلق"));
}));

export const vendorRouter = router;
