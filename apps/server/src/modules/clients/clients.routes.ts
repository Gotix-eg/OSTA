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

const clientRequestRecords: ClientRequestRecord[] = [
  {
    id: "req-101",
    requestNumber: "OSTA-101",
    categoryId: "electrical",
    serviceId: "electrical-emergency",
    title: "Urgent electrical repair",
    description: "Main kitchen socket stopped working and the breaker trips every few minutes.",
    mediaNotes: "3 images attached from the kitchen panel.",
    address: {
      mode: "saved",
      savedAddressId: "home-new-cairo"
    },
    timing: {
      type: "emergency"
    },
    status: "WORKER_EN_ROUTE",
    area: "New Cairo",
    createdAt: "2026-03-28T09:20:00.000Z",
    updatedAt: "2026-03-28T09:32:00.000Z"
  },
  {
    id: "req-102",
    requestNumber: "OSTA-102",
    categoryId: "plumbing",
    serviceId: "plumbing-repair",
    title: "Kitchen plumbing fix",
    description: "There is a leak under the kitchen sink and the cabinet base is getting wet.",
    mediaNotes: "Short voice note added with leak sound.",
    address: {
      mode: "saved",
      savedAddressId: "villa-maadi"
    },
    timing: {
      type: "today"
    },
    status: "IN_PROGRESS",
    area: "Maadi",
    createdAt: "2026-03-28T08:10:00.000Z",
    updatedAt: "2026-03-28T10:05:00.000Z"
  },
  {
    id: "req-103",
    requestNumber: "OSTA-103",
    categoryId: "painting",
    serviceId: "painting-finishes",
    title: "Living room painting",
    description: "Need a quick repaint for one wall with minor finishing touchups.",
    mediaNotes: "Color reference was shared.",
    address: {
      mode: "saved",
      savedAddressId: "home-new-cairo"
    },
    timing: {
      type: "tomorrow"
    },
    status: "COMPLETED",
    area: "New Cairo",
    createdAt: "2026-03-24T15:00:00.000Z",
    updatedAt: "2026-03-25T18:00:00.000Z"
  }
];

const favoriteWorkers: any[] = [];

const walletData = {
  balance: 0,
  currency: "EGP",
  spendThisMonth: 0,
  pendingRefunds: 0,
  paymentMethods: [],
  recentTransactions: []
};

const clientSettings = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  },
  preferences: {
    language: "ar",
    notificationsBySms: false,
    notificationsByEmail: false,
    marketingUpdates: false
  },
  addresses: []
};

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

router.get("/favorites", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: {
          totalFavorites: 0,
          onlineNow: 0,
          avgRating: 0
        },
        workers: favoriteWorkers
      },
      "Favorite workers fetched"
    )
  );
});

router.get("/wallet", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        ...walletData
      },
      "Wallet fetched"
    )
  );
});

router.get("/settings", (_request, response) => {
  response.status(200).json(successResponse(clientSettings, "Client settings fetched"));
});

export const clientsRouter = router;
