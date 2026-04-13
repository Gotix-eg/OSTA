import { Router, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { z } from "zod";

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
import { prisma } from "../../lib/prisma.js";

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

// =============================================
// Vendor Profile Routes
// =============================================

router.post("/register", catchAsync(async (request, response) => {
  const payload = parseBody(registerVendorSchema, request.body);
  const result = await vendorService.register(payload);
  setAuthCookies(response, { accessToken: result.accessToken, refreshToken: result.refreshToken, role: result.user.role });
  response.status(201).json(successResponse(result, "تم إنشاء حساب المحل بنجاح"));
}));

router.get("/profile", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const result = await vendorService.getProfile(request.auth!.userId);
  response.json(successResponse(result, "بيانات المحل"));
}));

router.put("/profile", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorProfileSchema, request.body);
  const result = await vendorService.updateProfile(request.auth!.userId, payload);
  response.json(successResponse(result, "تم تحديث بيانات المحل"));
}));

router.patch("/profile", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorProfileSchema.partial(), request.body);
  const result = await vendorService.updateProfile(request.auth!.userId, payload);
  response.json(successResponse(result, "تم تحديث بيانات المحل"));
}));

router.put("/location", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorLocationSchema, request.body);
  const result = await vendorService.updateLocation(request.auth!.userId, payload.latitude, payload.longitude);
  response.json(successResponse(result, "تم تحديث الموقع"));
}));

router.put("/status", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(updateVendorStatusSchema, request.body);
  const result = await vendorService.updateStatus(request.auth!.userId, payload.isOpen);
  response.json(successResponse(result, payload.isOpen ? "المحل مفتوح" : "المحل مغلق"));
}));

// =============================================
// Vendor Product Management (Authenticated)
// =============================================

const productSchema = z.object({
  nameAr: z.string().min(2, "اسم المنتج مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  imageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || null),
  inStock: z.boolean().optional().default(true),
  stockQty: z.number().int().min(0).optional(),
});

// GET /api/vendors/products - my products
router.get("/products", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const products = await prisma.vendorProduct.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });
  response.json(successResponse(products, "منتجاتك"));
}));

// POST /api/vendors/products - add product
router.post("/products", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(productSchema, request.body);
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const product = await prisma.vendorProduct.create({
    data: {
      vendorId: vendor.id,
      nameAr: payload.nameAr,
      nameEn: payload.nameEn,
      description: payload.description,
      price: payload.price,
      imageUrl: payload.imageUrl ?? null,
      inStock: payload.inStock ?? true,
      stockQty: payload.stockQty,
    },
  });
  response.status(201).json(successResponse(product, "تم إضافة المنتج"));
}));

// PUT /api/vendors/products/:id - update product
router.put("/products/:id", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const payload = parseBody(productSchema.partial(), request.body);
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const product = await prisma.vendorProduct.findUnique({ where: { id: request.params.id } });
  if (!product || product.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  const updated = await prisma.vendorProduct.update({ where: { id: request.params.id }, data: payload });
  response.json(successResponse(updated, "تم تحديث المنتج"));
}));

// DELETE /api/vendors/products/:id - delete product
router.delete("/products/:id", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const product = await prisma.vendorProduct.findUnique({ where: { id: request.params.id } });
  if (!product || product.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  await prisma.vendorProduct.delete({ where: { id: request.params.id } });
  response.json(successResponse({ deleted: true }, "تم حذف المنتج"));
}));

// =============================================
// Vendor: Direct Orders Management
// =============================================

// GET /api/vendors/direct-orders
router.get("/direct-orders", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const orders = await prisma.directOrder.findMany({
    where: { vendorId: vendor.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  response.json(successResponse(orders, "الطلبات المباشرة"));
}));

// PUT /api/vendors/direct-orders/:id/status
router.put("/direct-orders/:id/status", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const order = await prisma.directOrder.findUnique({ where: { id: request.params.id } });
  if (!order || order.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  const updated = await prisma.directOrder.update({ where: { id: request.params.id }, data: { status: request.body.status } });
  response.json(successResponse(updated, "تم تحديث حالة الطلب"));
}));

// =============================================
// Public Routes (Client Browsing — no auth required)
// =============================================

// GET /api/vendors/stores — list open stores
router.get("/stores", catchAsync(async (request, response) => {
  const { governorate, category } = request.query as { governorate?: string; category?: string };
  const stores = await prisma.vendorProfile.findMany({
    where: {
      isOpen: true,
      ...(governorate ? { governorate } : {}),
      ...(category ? { category } : {}),
    },
    select: {
      id: true,
      shopName: true,
      shopNameAr: true,
      category: true,
      shopDescription: true,
      shopImageUrl: true,
      governorate: true,
      city: true,
      rating: true,
      ratingCount: true,
      totalOrders: true,
      isOpen: true,
      user: { select: { firstName: true, lastName: true } },
      _count: { select: { products: { where: { inStock: true } } } },
    },
    orderBy: [{ rating: "desc" }, { totalOrders: "desc" }],
    take: 80,
  });
  response.json(successResponse(stores, "المتاجر المتاحة"));
}));

// GET /api/vendors/stores/:vendorId/products — store detail + products
router.get("/stores/:vendorId/products", catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: request.params.vendorId },
    select: {
      id: true, shopName: true, shopNameAr: true, category: true,
      shopDescription: true, shopImageUrl: true, governorate: true,
      city: true, rating: true, ratingCount: true, isOpen: true,
    },
  });
  if (!vendor) throw new ApiError(404, "المتجر غير موجود");
  const products = await prisma.vendorProduct.findMany({
    where: { vendorId: request.params.vendorId, inStock: true },
    orderBy: { createdAt: "desc" },
  });
  response.json(successResponse({ vendor, products }, "منتجات المتجر"));
}));

// POST /api/vendors/stores/:vendorId/order — client places direct order
router.post("/stores/:vendorId/order", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const { items, deliveryNotes, paymentMethod } = request.body as {
    items: Array<{ productId: string; qty: number }>;
    deliveryNotes?: string;
    paymentMethod?: string;
  };
  if (!items || items.length === 0) throw new ApiError(400, "يجب اختيار منتج على الأقل");

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: request.params.vendorId } });
  if (!vendor) throw new ApiError(404, "المتجر غير موجود");
  if (!vendor.isOpen) throw new ApiError(400, "المتجر مغلق حالياً");

  const productIds = items.map(i => i.productId);
  const products = await prisma.vendorProduct.findMany({
    where: { id: { in: productIds }, vendorId: vendor.id, inStock: true },
  });
  if (products.length !== productIds.length) throw new ApiError(400, "بعض المنتجات غير متوفرة");

  const totalAmount = items.reduce((sum, item) => {
    const p = products.find(x => x.id === item.productId)!;
    return sum + p.price * item.qty;
  }, 0);

  const order = await prisma.directOrder.create({
    data: {
      vendorId: vendor.id,
      clientId: request.auth!.userId,
      totalAmount,
      deliveryNotes: deliveryNotes || null,
      paymentMethod: (paymentMethod as any) || "CASH_ON_DELIVERY",
      status: "PENDING",
      items: {
        create: items.map(item => {
          const p = products.find(x => x.id === item.productId)!;
          return { productId: item.productId, qty: item.qty, unitPrice: p.price };
        }),
      },
    },
    include: { items: { include: { product: true } } },
  });
  response.status(201).json(successResponse(order, "تم إرسال طلبك بنجاح"));
}));

// GET /api/vendors/my-orders — client sees their direct orders
router.get("/my-orders", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const orders = await prisma.directOrder.findMany({
    where: { clientId: request.auth!.userId },
    include: {
      items: { include: { product: true } },
      vendor: { select: { shopName: true, shopNameAr: true, shopImageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  response.json(successResponse(orders, "طلباتك المباشرة"));
}));

export const vendorRouter = router;
