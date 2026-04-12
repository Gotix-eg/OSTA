import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { settingsService } from "./settings.service.js";
import { updateSettingSchema, updateBulkSettingsSchema } from "./settings.validation.js";

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

// GET /api/settings - Fetch all dynamic settings
router.get("/", catchAsync(async (request, response) => {
  const result = await settingsService.getAllSettings();
  response.json(successResponse(result, "إعدادات المنصة"));
}));

// PUT /api/settings - Update a single setting (Admin only)
router.put("/", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), catchAsync(async (request, response) => {
  const payload = parseBody(updateSettingSchema, request.body);
  const result = await settingsService.updateSetting(payload);
  response.json(successResponse(result, "تم التحديث بنجاح"));
}));

// POST /api/settings/bulk - Bulk update settings (Admin only)
router.post("/bulk", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), catchAsync(async (request, response) => {
  const payload = parseBody(updateBulkSettingsSchema, request.body);
  const result = await settingsService.updateSettingsBulk(payload.settings);
  response.json(successResponse(result, "تم تحديث الإعدادات ككل"));
}));

export const settingsRouter = router;
