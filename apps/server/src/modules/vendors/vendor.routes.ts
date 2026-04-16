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

// Safely extract a string route param (fixes @types/express v5 string|string[] union)
const p = (val: string | string[] | undefined): string => (Array.isArray(val) ? val[0] ?? "" : val ?? "");

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
  const id = p(request.params["id"]);
  const product = await prisma.vendorProduct.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  const updated = await prisma.vendorProduct.update({ where: { id }, data: payload });
  response.json(successResponse(updated, "تم تحديث المنتج"));
}));

// DELETE /api/vendors/products/:id - delete product
router.delete("/products/:id", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");
  const id = p(request.params["id"]);
  const product = await prisma.vendorProduct.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  await prisma.vendorProduct.delete({ where: { id } });
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
  const id = p(request.params["id"]);
  const order = await prisma.directOrder.findUnique({ where: { id } });
  if (!order || order.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");
  const updated = await prisma.directOrder.update({ where: { id }, data: { status: request.body.status } });
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
      latitude: true,
      longitude: true,
      user: { select: { firstName: true, lastName: true } },
      _count: { select: { products: { where: { inStock: true } } } },
    },
    orderBy: [{ isOpen: "desc" }, { rating: "desc" }, { totalOrders: "desc" }],
    take: 100,
  });
  response.json(successResponse(stores, "المتاجر المتاحة"));
}));

// GET /api/vendors/stores/:vendorId/products — store detail + products
router.get("/stores/:vendorId/products", catchAsync(async (request, response) => {
  const vendorId = p(request.params["vendorId"]);
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    select: {
      id: true, shopName: true, shopNameAr: true, category: true,
      shopDescription: true, shopImageUrl: true, governorate: true,
      city: true, rating: true, ratingCount: true, isOpen: true,
    },
  });
  if (!vendor) throw new ApiError(404, "المتجر غير موجود");
  const products = await prisma.vendorProduct.findMany({
    where: { vendorId, inStock: true },
    orderBy: { createdAt: "desc" },
  });
  response.json(successResponse({ vendor, products }, "منتجات المتجر"));
}));

// POST /api/vendors/stores/:vendorId/order — client places direct order
router.post("/stores/:vendorId/order", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const vendorId = p(request.params["vendorId"]);
  const { items, deliveryNotes, paymentMethod } = request.body as {
    items: Array<{ productId: string; qty: number }>;
    deliveryNotes?: string;
    paymentMethod?: string;
  };
  if (!items || items.length === 0) throw new ApiError(400, "يجب اختيار منتج على الأقل");

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
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

// =============================================
// Custom Requests (Client sends text to vendor)
// =============================================

// POST /api/vendors/stores/:vendorId/custom-request — client sends a custom request
router.post("/stores/:vendorId/custom-request", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const vendorId = p(request.params["vendorId"]);
  const { message, clientPhone } = request.body as { message: string; clientPhone?: string };

  if (!message || message.trim().length < 5) {
    throw new ApiError(400, "يرجى كتابة وصف واضح للطلب (5 حروف على الأقل)");
  }

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new ApiError(404, "المتجر غير موجود");

  const user = await prisma.user.findUnique({ where: { id: request.auth!.userId } });
  if (!user) throw new ApiError(404, "المستخدم غير موجود");

  const customRequest = await prisma.customRequest.create({
    data: {
      vendorId,
      clientId: request.auth!.userId,
      clientName: `${user.firstName} ${user.lastName}`.trim(),
      clientPhone: clientPhone || user.phone || undefined,
      message: message.trim(),
    },
  });

  // Create Notification for the Vendor
  await prisma.notification.create({
    data: {
      userId: vendor.userId,
      type: "CUSTOM_REQUEST_NEW",
      title: "طلب مخصص جديد",
      body: `لقد استلمت طلب جديد من ${customRequest.clientName}`,
      data: { customRequestId: customRequest.id }
    }
  });

  response.status(201).json(successResponse(customRequest, "تم إرسال طلبك للمتجر بنجاح"));
}));

// GET /api/vendors/custom-requests — vendor sees incoming custom requests
router.get("/custom-requests", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");

  const requests = await prisma.customRequest.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  response.json(successResponse(requests, "الطلبات المخصصة"));
}));

// PUT /api/vendors/custom-requests/:id/reply — vendor replies to a custom request
router.patch("/custom-requests/:id/reply", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");

  const id = p(request.params["id"]);
  const cr = await prisma.customRequest.findUnique({ where: { id } });
  if (!cr || cr.vendorId !== vendor.id) throw new ApiError(403, "غير مصرح لك");

  const { reply, price } = request.body as { reply: string; price?: number };
  if (!reply || reply.trim().length < 2) throw new ApiError(400, "يرجى كتابة رد");

  const updated = await prisma.customRequest.update({
    where: { id },
    data: { 
      vendorReply: reply.trim(), 
      price: price ? Number(price) : null,
      status: "REPLIED" 
    },
  });

  // Create Notification for the Client
  await prisma.notification.create({
    data: {
      userId: cr.clientId,
      type: "CUSTOM_REQUEST_REPLY",
      title: "رد من المتجر",
      body: `قام متجر ${vendor.shopNameAr || vendor.shopName} بالرد على طلبك المخصص`,
      data: { customRequestId: cr.id, vendorId: vendor.id }
    }
  });

  response.json(successResponse(updated, "تم إرسال الرد"));
}));

// GET /api/vendors/my-custom-requests — client sees their sent custom requests
router.get("/my-custom-requests", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const requests = await prisma.customRequest.findMany({
    where: { clientId: request.auth!.userId },
    include: {
        vendor: { select: { id: true, shopName: true, shopNameAr: true, shopImageUrl: true, userId: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  response.json(successResponse(requests, "طلباتك المخصصة"));
}));

// PATCH /api/vendors/custom-requests/:id/accept — client accepts the offer
router.patch("/custom-requests/:id/accept", authenticate, requireRoles("CLIENT", "WORKER"), catchAsync(async (request, response) => {
  const { id } = request.params;
  const { deliveryMethod, paymentMethod } = request.body as { deliveryMethod: string; paymentMethod: string };

  if (!deliveryMethod || !paymentMethod) {
    throw new ApiError(400, "يرجى اختيار طريقة التوصيل والدفع");
  }

  const cr = await prisma.customRequest.findUnique({ 
    where: { id },
    include: { vendor: true }
  });
  
  if (!cr || cr.clientId !== request.auth!.userId) throw new ApiError(404, "الطلب غير موجود");
  if (cr.status !== "REPLIED") throw new ApiError(400, "لا يمكن قبول هذا الطلب في حالته الحالية");

  const updated = await prisma.customRequest.update({
    where: { id },
    data: { 
      deliveryMethod, 
      paymentMethod, 
      status: "ACCEPTED" 
    },
  });

  // Notify Vendor
  await prisma.notification.create({
    data: {
      userId: cr.vendor.userId,
      type: "CUSTOM_REQUEST_ACCEPTED",
      title: "تم قبول عرضك",
      body: `قام العميل ${cr.clientName} بقبول عرضك ومتابعة الطلب`,
      data: { customRequestId: cr.id }
    }
  });

  response.json(successResponse(updated, "تم قبول الطلب بنجاح"));
}));

// PATCH /api/vendors/custom-requests/:id/status — vendor updates order status
router.patch("/custom-requests/:id/status", authenticate, requireRoles("VENDOR"), catchAsync(async (request, response) => {
  const { id } = request.params;
  const { status } = request.body as { status: "PREPARING" | "SHIPPED" | "COMPLETED" | "REJECTED" | "CLOSED" };

  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!vendor) throw new ApiError(404, "الملف التجاري غير موجود");

  const cr = await prisma.customRequest.findUnique({ where: { id } });
  if (!cr || cr.vendorId !== vendor.id) throw new ApiError(404, "الطلب غير موجود");

  const updated = await prisma.customRequest.update({
    where: { id },
    data: { status },
  });

  // Notify Client of status change
  let statusTitle = "تحديث في طلبك";
  let statusBody = `تم تحديث حالة طلبك إلى: ${status}`;

  if (status === "PREPARING") {
    statusTitle = "جاري تحضير طلبك";
    statusBody = `بدأ متجر ${vendor.shopNameAr || vendor.shopName} في تحضير طلبك المخصص`;
  } else if (status === "SHIPPED") {
    statusTitle = "تم شحن طلبك";
    statusBody = `طلبك المخصص في الطريق إليك الآن`;
  } else if (status === "COMPLETED") {
    statusTitle = "اكتمل الطلب";
    statusBody = `نتمنى أن تكون قد استمتعت بتجربتك مع متجر ${vendor.shopNameAr || vendor.shopName}`;
  }

  await prisma.notification.create({
    data: {
      userId: cr.clientId,
      type: "CUSTOM_REQUEST_STATUS_CHANGE",
      title: statusTitle,
      body: statusBody,
      data: { customRequestId: cr.id }
    }
  });

  response.json(successResponse(updated, "تم تحديث الحالة"));
}));

export const vendorRouter = router;

