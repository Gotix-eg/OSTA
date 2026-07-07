import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendPushNotification } from "../../utils/push.util.js";

const router = Router();

router.use(authenticate);

// GET /api/notifications — Get all notifications for the authenticated user
router.get("/", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  response.json(successResponse(notifications, "تم جلب الإشعارات بنجاح"));
}));

// GET /api/notifications/unread-count — Get the number of unread notifications
router.get("/unread-count", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  response.json(successResponse({ unreadCount: count }, "عدد الإشعارات غير المقروءة"));
}));

// PATCH /api/notifications/:id/read — Mark a specific notification as read
router.patch("/:id/read", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const { id } = request.params as { id: string };

  const notification = await prisma.notification.findUnique({ where: { id } });
  
  if (!notification || notification.userId !== userId) {
    throw new ApiError(404, "الإشعار غير موجود");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });

  response.json(successResponse(updated, "تم تحديد الإشعار كمقروء"));
}));

// PATCH /api/notifications/read-all — Mark all notifications as read
router.patch("/read-all", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  response.json(successResponse({}, "تم تحديد جميع الإشعارات كمقروءة"));
}));

// POST /api/notifications/push-token — Save or update the Expo push token for this user
router.post("/push-token", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const { token } = request.body as { token: string };

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Push token مطلوب");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken: token },
  });

  response.json(successResponse({}, "تم حفظ push token بنجاح"));
}));

// DELETE /api/notifications/push-token — Remove push token on logout
router.delete("/push-token", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;

  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken: null },
  });

  response.json(successResponse({}, "تم حذف push token"));
}));

export const notificationsRouter = router;
