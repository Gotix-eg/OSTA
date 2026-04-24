import { Router, Request, Response } from "express";
import { UserRole } from "@prisma/client";

import { ZodError, z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { prisma } from "../../lib/prisma.js";

const router = Router();

router.use(authenticate, requireRoles(UserRole.CLIENT));

const requestStatusSchema = z.enum(["PENDING", "WORKER_EN_ROUTE", "IN_PROGRESS", "COMPLETED"]);

const createRequestSchema = z
  .object({
    categoryId: z.string().min(1),
    serviceId: z.string().min(1),
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(1200),
    mediaNotes: z.string().max(500).optional(),
    address: z
      .object({
        mode: z.enum(["saved", "new"]),
        savedAddressId: z.string().optional(),
        governorate: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        street: z.string().optional()
      })
      .superRefine((value, context) => {
        if (value.mode === "saved" && !value.savedAddressId) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["savedAddressId"],
            message: "Saved address is required"
          });
        }

        if (value.mode === "new") {
          for (const key of ["governorate", "city", "district", "street"] as const) {
            if (!value[key]) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                path: [key],
                message: `${key} is required`
              });
            }
          }
        }
      }),
    timing: z
      .object({
        type: z.enum(["emergency", "today", "tomorrow", "custom"]),
        customDate: z.string().optional(),
        customWindow: z.string().optional()
      })
      .superRefine((value, context) => {
        if (value.type === "custom" && (!value.customDate || !value.customWindow)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["customDate"],
            message: "Custom date and window are required"
          });
        }
      }),
    images: z.array(z.string()).optional(),
    voiceNote: z.string().optional(),
    videoUrl: z.string().optional()
  });

type ClientRequestRecord = {
  id: string;
  requestNumber: string;
  categoryId: string;
  serviceId: string;
  title: string;
  description: string;
  mediaNotes: string;
  images?: string[];
  voiceNote?: string;
  videoUrl?: string;
  address: {
    mode: "saved" | "new";
    savedAddressId?: string;
    governorate?: string;
    city?: string;
    district?: string;
    street?: string;
  };
  timing: {
    type: "emergency" | "today" | "tomorrow" | "custom";
    customDate?: string;
    customWindow?: string;
  };
  status: z.infer<typeof requestStatusSchema>;
  area: string;
  createdAt: string;
   updatedAt: string;
 };

 // All data endpoints now query the database directly

function parseBody<T>(schema: { parse: (value: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "Validation failed", JSON.stringify(error.flatten().fieldErrors));
    }

    throw error;
  }
}

function getRequestArea(address: ClientRequestRecord["address"]) {
  if (address.mode === "saved") {
    return address.savedAddressId === "villa-maadi" ? "Maadi" : "New Cairo";
  }

  return `${address.city ?? "Cairo"}`;
}

router.get("/dashboard", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");

  // Fetch real sub-summaries (Mocked for UI structure but using some real data)
  const totalRequests = await prisma.serviceRequest.count({ where: { clientId: profile.id } });
  
  // Real Worker Discovery (The User's core request)
  // Logic: Active trial OR quota, VERIFIED, sorted by Rating
  const now = new Date();
  const eligibleWorkers = await prisma.workerProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      OR: [
        { trialExpiresAt: { gt: now } },
        { orderQuota: { gt: 0 } }
      ]
    },
    orderBy: {
      rating: "desc"
    },
    take: 5,
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  const activeRequests = await prisma.serviceRequest.findMany({
    where: { clientId: profile.id, status: { in: ["WORKER_EN_ROUTE", "IN_PROGRESS"] } },
    include: { worker: { include: { user: true } } }
  });

  response.status(200).json(
    successResponse(
      {
        summary: {
          totalRequests,
          totalRequestsDelta: 0,
          activeRequests: activeRequests.length,
          enRouteCount: activeRequests.filter(r => r.status === "WORKER_EN_ROUTE").length,
          activeWarranties: 0,
          walletBalance: profile.walletBalance // Standardized
        },
        activeRequests: activeRequests.map(r => ({
          id: r.id,
          service: r.serviceId,
          status: r.status,
          workerName: r.worker ? `${r.worker.user.firstName} ${r.worker.user.lastName}` : "Pending",
          etaMinutes: 15, // Mocked ETA
          area: "newCairo"
        })),
        suggestedServices: ["acMaintenance", "electricalInspection", "paintingRefresh"],
        recentCompleted: [],
        favoriteWorkers: eligibleWorkers.map(w => ({
          id: w.id,
          name: `${w.user.firstName} ${w.user.lastName}`,
          specialty: "electrician", // Should be mapped from WorkerSpecialization
          rating: w.rating
        }))
      },
      "Client dashboard fetched"
    )
  );
}));

router.get("/requests", catchAsync(async (request: Request, response: Response) => {
  const profile = await prisma.clientProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");

  const reqs = await prisma.serviceRequest.findMany({
    where: { clientId: profile.id },
    include: {
      service: { select: { nameAr: true, nameEn: true } },
      address: true,
    },
    orderBy: { createdAt: "desc" }
  });

  response.status(200).json(
    successResponse(
      reqs.map((item: any) => ({
        id: item.id,
        requestNumber: item.requestNumber,
        title: item.title,
        serviceId: item.serviceId,
        status: item.status,
        area: item.address ? item.address.city : "Unknown",
        createdAt: item.createdAt
      })),
      "Client requests fetched"
    )
  );
}));

router.get("/requests/:id", catchAsync(async (request: Request, response: Response) => {
  const profile = await prisma.clientProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");
  const { id } = request.params as { id: string };

  const record = await prisma.serviceRequest.findUnique({
    where: { id: id, clientId: profile.id },
    include: { service: true, address: true }
  });

  if (!record) {
    throw new ApiError(404, "Request not found");
  }

  response.status(200).json(successResponse(record, "Client request fetched"));
}));

router.post("/requests", catchAsync(async (request: Request, response: Response) => {
  const payload = parseBody(createRequestSchema, request.body);
  
  const profile = await prisma.clientProfile.findUnique({ where: { userId: request.auth!.userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");
  const clientId = profile.id;

  let addressId = payload.address.savedAddressId;
  if (payload.address.mode === "new" || !addressId) {
    const newAddress = await prisma.address.create({
      data: {
        userId: request.auth!.userId,
        governorate: payload.address.governorate!,
        city: payload.address.city!,
        area: payload.address.city!,
        street: payload.address.street!,
        label: "New Address",
      }
    });
    addressId = newAddress.id;
  }

  let preferredDate: Date | null = null;
  if (payload.timing.type === "today") preferredDate = new Date();
  if (payload.timing.type === "tomorrow") { preferredDate = new Date(); preferredDate.setDate(preferredDate.getDate() + 1); }
  if (payload.timing.type === "custom" && payload.timing.customDate) {
    preferredDate = new Date(payload.timing.customDate);
  }

  const record = await prisma.serviceRequest.create({
    data: {
      clientId,
      serviceId: payload.serviceId,
      addressId: addressId!,
      title: payload.title,
      description: payload.description,
      images: payload.images ?? [],
      voiceNote: payload.voiceNote,
      videoUrl: payload.videoUrl,
      preferredDate,
      preferredTimeSlot: payload.timing.customWindow,
      urgency: payload.timing.type === "emergency" ? "EMERGENCY" : "NORMAL",
      status: "PENDING",
    }
  });

  // System notification for the client
  await prisma.notification.create({
    data: {
      userId: request.auth!.userId,
      type: "SYSTEM",
      title: "تم استلام الطلب",
      body: `تم استلام طلب الصيانة الخاص بك (${record.requestNumber}) وجاري البحث عن فني مناسب.`,
    }
  });

  response.status(201).json(
    successResponse(
      {
        id: record.id,
        requestNumber: record.requestNumber,
        title: record.title,
        status: record.status,
        createdAt: record.createdAt,
        reviewEta: "Within 5 minutes"
      },
      "Client request created"
    )
  );
}));

router.get("/favorites", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");

  const favorites = await prisma.favoriteWorker.findMany({
    where: { clientId: profile.id },
    include: {
      worker: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          specializations: { include: { service: true } }
        }
      }
    }
  });

  response.status(200).json(
    successResponse(
      {
        summary: {
          totalFavorites: favorites.length,
          onlineNow: favorites.filter(f => f.worker.isOnline).length,
          avgRating: favorites.length > 0 ? favorites.reduce((sum, f) => sum + (f.worker.rating || 0), 0) / favorites.length : 0
        },
        workers: favorites.map(f => ({
          id: f.worker.id,
          name: `${f.worker.user.firstName} ${f.worker.user.lastName}`,
          specialty: f.worker.specializations[0]?.service.nameEn || "general",
          rating: f.worker.rating,
          completedJobs: f.worker.totalJobsCompleted,
          area: f.worker.workAreas[0]?.area || "Unknown",
          availability: f.worker.isAvailable ? "available" : "busy"
        }))
      },
      "Favorite workers fetched"
    )
  );
}));

router.get("/wallet", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Client profile not found");

  // Get recent transactions (last 10)
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  // Calculate monthly spend (sum of payments/expenses this month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlySpend = await prisma.walletTransaction.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      type: { in: ["payment", "order"] } // Adjust based on your transaction types
    },
    _sum: { amount: true }
  });

  const pendingRefunds = await prisma.walletTransaction.aggregate({
    where: {
      userId,
      type: "refund"
    },
    _sum: { amount: true }
  });

  response.status(200).json(
    successResponse(
      {
        balance: profile.walletBalance,
        currency: "EGP",
        spendThisMonth: monthlySpend._sum.amount || 0,
        pendingRefunds: pendingRefunds._sum.amount || 0,
        paymentMethods: [], // TODO: fetch from payment_methods table if exists
        recentTransactions: transactions.map(t => ({
          id: t.id,
          type: t.type as "topup" | "payment" | "refund",
          amount: t.amount,
          label: t.description || t.type,
          createdAt: t.createdAt.toISOString()
        }))
      },
      "Wallet fetched"
    )
  );
}));

router.get("/settings", catchAsync(async (request: Request, response: Response) => {
  const userId = request.auth!.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true, phone: true, preferredLanguage: true }
  });
  if (!user) throw new ApiError(404, "User not found");

  const addresses = await prisma.address.findMany({
    where: { userId },
    select: { id: true, label: true, isDefault: true, governorate: true, city: true, area: true, street: true }
  });

  response.status(200).json(
    successResponse(
      {
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email || "",
          phone: user.phone
        },
        preferences: {
          language: user.preferredLanguage || "ar",
          notificationsBySms: false, // TODO: add to user/client profile if needed
          notificationsByEmail: false,
          marketingUpdates: false
        },
        addresses
      },
      "Client settings fetched"
    )
  );
}));

export const clientsRouter = router;
