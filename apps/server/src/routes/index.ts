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

router.get("/debug-user/:phone", async (request, response) => {
  const { phone } = request.params;
  try {
    const user = await prisma.user.findFirst({
      where: { phone },
      select: { id: true, role: true, phone: true, status: true }
    });
    response.status(200).json(user || { error: "User not found" });
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});

router.get("/debug-fix-admin", async (_request, response) => {
  try {
    const { hashPassword } = await import("../utils/password.js");
    const passwordHash = await hashPassword("Letmein@NZ");
    
    // Find any admin or super admin or the specific phone
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phone: "01009410112" },
          { phone: "+201009410112" },
          { role: "SUPER_ADMIN" },
          { role: "ADMIN" }
        ]
      }
    });

    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { 
          phone: "01009410112",
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE"
        }
      });
      response.status(200).json({ message: "Admin fixed", user: updated.id });
    } else {
      response.status(404).json({ message: "No admin user found to fix" });
    }
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});

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
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";

router.use("/auth", authRouter);
router.use("/clients", clientsRouter);
router.use("/workers", workersRouter);
router.use("/admin", adminRouter);
router.use("/services", servicesRouter);
router.use("/vendors", vendorRouter);
router.use("/materials", materialsRouter);
router.use("/ads", adsRouter);
router.use("/settings", settingsRouter);
router.use("/notifications", notificationsRouter);

export const apiRouter = router;
