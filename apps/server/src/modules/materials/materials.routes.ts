import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { materialsService } from "./materials.service.js";
import {
  createMaterialRequestSchema,
  createMaterialOfferSchema,
  acceptOfferSchema
} from "./materials.validation.js";

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
// Client & Worker Routes
// ============================

router.post("/requests", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const payload = parseBody(createMaterialRequestSchema, request.body);
  const result = await materialsService.createRequest(request.auth!.userId, request.auth!.role, payload);
  response.status(201).json(successResponse(result, "تم إنشاء الطلب بنجاح وهو الآن متاح للتجار"));
}));

router.get("/requests", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const result = await materialsService.getMyRequests(request.auth!.userId);
  response.json(successResponse(result, "الطلبات"));
}));

router.get("/requests/:id", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const result = await materialsService.getRequestDetails(request.params.id as string, request.auth!.userId);
  response.json(successResponse(result, "تفاصيل الطلب"));
}));

router.post("/offers/:id/accept", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const payload = parseBody(acceptOfferSchema, request.body);
  const result = await materialsService.acceptOffer(request.body.requestId as string, request.params.id as string, request.auth!.userId, payload);
  response.json(successResponse(result, "تم قبول العرض!"));
}));


// ============================
// Vendor Routes
// ============================

router.get("/vendor/nearby-requests", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const result = await materialsService.getNearbyRequests(request.auth!.userId);
  response.json(successResponse(result, "الطلبات القريبة"));
}));

router.post("/vendor/requests/:id/offer", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(createMaterialOfferSchema, request.body);
  const result = await materialsService.createOffer(request.params.id as string, request.auth!.userId, payload);
  response.status(201).json(successResponse(result, "تم إرسال عرض السعر للعميل"));
}));

router.get("/vendor/orders", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const result = await materialsService.getVendorOrders(request.auth!.userId);
  response.json(successResponse(result, "طلبات الفيندور"));
}));

router.put("/vendor/orders/:id/status", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const result = await materialsService.updateOrderStatus(request.params.id as string, request.auth!.userId, request.body.status);
  response.json(successResponse(result, "تم تحديث حالة الطلب"));
}));

export const materialsRouter = router;
