import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma.js";
import { errorResponse, successResponse } from "../../utils/ApiResponse.js";
import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";

export const waitlistRouter = Router();

const createWaitlistSchema = z.object({
  role: z.enum(["CLIENT", "VENDOR", "WORKER", "ADMIN", "SUPER_ADMIN"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(5),
});

// POST /waitlist - Submit to waitlist
waitlistRouter.post("/", async (req, res) => {
  try {
    const data = createWaitlistSchema.parse(req.body);

    const entry = await prisma.waitlistEntry.create({
      data: {
        role: data.role as any,
        email: data.email || null,
        phone: data.phone,
      },
    });

    return res.status(201).json(successResponse(entry, "Successfully added to waitlist"));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(errorResponse("Invalid input data", error.errors));
    }
    console.error("Waitlist Error:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
});

// GET /admin/waitlist (Admin only) - Get waitlist entries
waitlistRouter.get("/", authenticate, requireRoles("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(successResponse(entries));
  } catch (error: any) {
    console.error("Waitlist Fetch Error:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  }
});
