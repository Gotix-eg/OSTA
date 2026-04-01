import { PrismaClient } from "@prisma/client";

declare global {
  var __ostaPrisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__ostaPrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ostaPrisma__ = prisma;
}
