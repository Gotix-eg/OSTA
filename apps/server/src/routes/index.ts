import { Router } from "express";

import { adminRouter } from "../modules/admin/admin.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { clientsRouter } from "../modules/clients/clients.routes.js";
import { servicesRouter } from "../modules/services/services.routes.js";
import { workersRouter } from "../modules/workers/workers.routes.js";
import { successResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.status(200).json(successResponse({ status: "ok" }, "OSTA API is running"));
});

import { prisma } from "../lib/prisma.js";

router.get("/debug-env", async (_request, response) => {
  const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  let prismaOk = false;
  let prismaError = null;
  try {
    const count = await prisma.user.count();
    prismaOk = true;
  } catch (e: any) {
    prismaError = e.message || e.toString();
  }

  response.status(200).json({
    DATABASE_URL: dbUrl ? `${dbUrl.substring(0, 30)}...` : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
    PRISMA_OK: prismaOk,
    PRISMA_ERROR: prismaError
  });
});

import { vendorRouter } from "../modules/vendors/vendor.routes.js";
import { materialsRouter } from "../modules/materials/materials.routes.js";
import { adsRouter } from "../modules/ads/ads.routes.js";
import { settingsRouter } from "../modules/settings/settings.routes.js";

router.use("/auth", authRouter);
router.use("/clients", clientsRouter);
router.use("/workers", workersRouter);
router.use("/admin", adminRouter);
router.use("/services", servicesRouter);
router.use("/vendors", vendorRouter);
router.use("/materials", materialsRouter);
router.use("/ads", adsRouter);
router.use("/settings", settingsRouter);

export const apiRouter = router;
