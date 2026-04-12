import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AdPlacement } from "@prisma/client";
import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { adsService } from "./ads.service.js";
import { createAdCampaignSchema, updateAdStatusSchema } from "./ads.validation.js";

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

// ============================
// Public / Serving Routes
// ============================

// GET /api/ads/serve?placement=HOMEPAGE
router.get("/serve", catchAsync(async (request, response) => {
  const placement = request.query.placement as AdPlacement;
  if (!placement) {
    throw new ApiError(400, "Placement parameter is required");
  }
  
  const results = await adsService.getServedAds(placement);
  
  // Asynchronously record impressions without waiting
  results.forEach(ad => {
    adsService.recordImpression(ad.id).catch(err => console.error("Impression error", err));
  });

  response.json(successResponse(results, "Ads fetched successfully"));
}));

// POST /api/ads/:id/click
router.post("/:id/click", catchAsync(async (request, response) => {
  await adsService.recordClick(request.params.id as string);
  response.json(successResponse({ success: true }, "Click recorded"));
}));


// ============================
// Admin Management Routes
// ============================

// GET /api/ads
router.get("/", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), catchAsync(async (request, response) => {
  const results = await adsService.getAllCampaigns();
  response.json(successResponse(results, "تم استرجاع الإعلانات"));
}));

// POST /api/ads
router.post("/", authenticate, requireRoles("ADMIN", "SUPER_ADMIN", "VENDOR", "WORKER"), catchAsync(async (request, response) => {
  const payload = parseBody(createAdCampaignSchema, request.body);
  
  // If not admin, force ownerId to be the requester
  if (request.auth?.role !== "ADMIN" && request.auth?.role !== "SUPER_ADMIN") {
    payload.ownerId = request.auth!.userId;
  }

  const result = await adsService.createCampaign(payload);
  response.status(201).json(successResponse(result, "تم إنشاء الحملة الإعلانية بنجاح وسيتم تفعيلها فور الموافقة"));
}));

// PUT /api/ads/:id/status
router.put("/:id/status", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), catchAsync(async (request, response) => {
  const payload = parseBody(updateAdStatusSchema, request.body);
  const result = await adsService.updateCampaignStatus(request.params.id as string, payload.status);
  response.json(successResponse(result, "تم تحديث حالة الإعلان"));
}));

// DELETE /api/ads/:id
router.delete("/:id", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), catchAsync(async (request, response) => {
  await adsService.deleteCampaign(request.params.id as string);
  response.json(successResponse({ success: true }, "تم حذف الإعلان"));
}));

export const adsRouter = router;
