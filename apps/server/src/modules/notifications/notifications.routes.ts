import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

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

export const notificationsRouter = router;
