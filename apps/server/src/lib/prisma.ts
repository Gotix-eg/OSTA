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
            socketService.sendNotification(notification.userId as string, notification);
          }
        } catch (error) {
          console.error("Socket error on notification create:", error);
        }
        return notification;
      }
    }
  }
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.__ostaPrisma__ = prisma;
}
