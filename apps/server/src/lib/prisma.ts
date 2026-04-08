import { PrismaClient } from "@prisma/client";

declare global {
  var __ostaPrisma__: PrismaClient | undefined;
}

function getDatabaseUrl() {
  const unpooled = process.env.DATABASE_URL_UNPOOLED;
  if (unpooled) return unpooled;

  let url = process.env.DATABASE_URL || "";
  if (url.includes("pooler.c-") && !url.includes("pgbouncer=true")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  return url;
}

export const prisma = globalThis.__ostaPrisma__ ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__ostaPrisma__ = prisma;
}
