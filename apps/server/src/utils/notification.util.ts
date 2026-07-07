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

    // 3. Send Expo Push Notification (if pushToken is registered)
    try {
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { pushToken: true }
      });

      if (user?.pushToken) {
        const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            to: user.pushToken,
            sound: "default",
            title: params.title,
            body: params.body,
            data: params.data || {},
          }),
        });

        if (!expoResponse.ok) {
          const errText = await expoResponse.text();
          console.error("Expo push notification service returned error:", errText);
        } else {
          console.log(`Push notification sent successfully to user ${params.userId}`);
        }
      }
    } catch (pushError) {
      // Don't crash the main process if push notification fails
      console.error("Failed to send Expo push notification:", pushError);
    }

    return notification;
  } catch (error) {
    console.error("Failed to send app notification:", error);
    throw error;
  }
}
