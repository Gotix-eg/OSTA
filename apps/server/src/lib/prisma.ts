import { PrismaClient } from "@prisma/client";

declare global {
  var __ostaPrisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__ostaPrisma__ ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__ostaPrisma__ = prisma;
}
