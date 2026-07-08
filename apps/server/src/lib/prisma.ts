import { PrismaClient } from "@prisma/client";

declare global {
  var __ostaPrisma__: PrismaClient | undefined;
}

function getDatabaseUrl() {
  if (process.env.OSTA_DB_URL) return process.env.OSTA_DB_URL;

  const unpooled = process.env.DATABASE_URL_UNPOOLED;
  if (unpooled) return unpooled;

  let url = process.env.DATABASE_URL || "";
  if (url.includes("pooler.c-") && !url.includes("pgbouncer=true")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  return url;
}

import { socketService } from "./socket.js";
import { sendPushNotification } from "../utils/push.util.js";

const basePrisma = globalThis.__ostaPrisma__ ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

export const prisma = basePrisma.$extends({
  query: {
    notification: {
      async create({ args, query }) {
        const notification = await query(args);
        try {
          if (notification && notification.userId) {
            const userId = notification.userId as string;

            // 1. Send real-time in-app notification via Socket.io
            socketService.sendNotification(userId, notification);

            // 2. Send push notification to the user's mobile device
            // Fetch the user's Expo push token from DB (non-blocking)
            basePrisma.user.findUnique({
              where: { id: userId },
              select: { expoPushToken: true }
            }).then((user) => {
              if (user?.expoPushToken) {
                const notifData = (notification.data as any) || {};
                sendPushNotification(user.expoPushToken, {
                  title: notification.title as string,
                  body: notification.body as string,
                  data: {
                    type: notification.type as string,
                    notificationId: notification.id as string,
                    ...notifData,
                  },
                  channelId: notification.type === "CHAT_MESSAGE" ? "chat" : "default",
                });
              }
            }).catch((err) => {
              console.error("Failed to fetch push token for notification:", err);
            });
          }
        } catch (error) {
          console.error("Error on notification create hook:", error);
        }
        return notification;
      }
    }
  }
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.__ostaPrisma__ = prisma;
}
