import { prisma } from "../lib/prisma.js";
import { socketService } from "../lib/socket.js";
import { NotificationType } from "@prisma/client";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

export async function sendAppNotification(params: SendNotificationParams) {
  try {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data || {},
      },
    });

    // 2. Emit real-time via Socket.io
    socketService.sendNotification(params.userId, notification);

    return notification;
  } catch (error) {
    console.error("Failed to send app notification:", error);
    throw error;
  }
}
