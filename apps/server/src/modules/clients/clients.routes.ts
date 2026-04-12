import { Router } from "express";
import { UserRole } from "@prisma/client";

import { ZodError, z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";

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

const favoriteWorkers = [
  {
    id: "worker-1",
    name: "Ahmed Fawzy",
    specialty: "AC Technician",
    rating: 4.9,
    completedJobs: 354,
    area: "New Cairo",
    availability: "Available tomorrow"
  },
  {
    id: "worker-2",
    name: "Youssef El-Sharif",
    specialty: "Electrician",
    rating: 4.9,
    completedJobs: 312,
    area: "Nasr City",
    availability: "Online now"
  },
  {
    id: "worker-3",
    name: "Mostafa Adel",
    specialty: "Plumber",
    rating: 4.8,
    completedJobs: 287,
    area: "Maadi",
    availability: "Today 7 PM"
  }
];

const walletData = {
  balance: 860,
  currency: "EGP",
  spendThisMonth: 2140,
  pendingRefunds: 180,
  paymentMethods: [
    { id: "card-1", label: "Visa ending 1842", isDefault: true },
    { id: "wallet-1", label: "Vodafone Cash", isDefault: false }
  ],
  recentTransactions: [
    { id: "txn-1", type: "topup", amount: 500, label: "Wallet top-up", createdAt: "2026-03-27T18:30:00.000Z" },
    { id: "txn-2", type: "payment", amount: -320, label: "Electrical repair payment", createdAt: "2026-03-27T19:10:00.000Z" },
    { id: "txn-3", type: "refund", amount: 180, label: "Partial refund", createdAt: "2026-03-25T15:00:00.000Z" }
  ]
};

const clientSettings = {
  profile: {
    firstName: "Mariam",
    lastName: "Hassan",
    email: "mariam@osta.eg",
    phone: "+201000000000"
  },
  preferences: {
    language: "ar",
    notificationsBySms: true,
    notificationsByEmail: true,
    marketingUpdates: false
  },
  addresses: [
    { id: "home-new-cairo", label: "Home - New Cairo", isDefault: true },
    { id: "villa-maadi", label: "Villa - Maadi", isDefault: false }
  ]
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

router.get("/dashboard", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: {
          totalRequests: 28,
          totalRequestsDelta: 4,
          activeRequests: 3,
          enRouteCount: 1,
          activeWarranties: 2,
          walletBalance: 860
        },
        activeRequests: [
          {
            id: "req-101",
            service: "electricalRepair",
            status: "WORKER_EN_ROUTE",
            workerName: "Youssef El-Sharif",
            etaMinutes: 18,
            area: "newCairo"
          },
          {
            id: "req-102",
            service: "kitchenPlumbing",
            status: "IN_PROGRESS",
            workerName: "Mostafa Adel",
            onSite: true,
            area: "maadi"
          }
        ],
        suggestedServices: ["acMaintenance", "electricalInspection", "paintingRefresh"],
        recentCompleted: [
          { id: "req-201", service: "livingRoomPainting", completedDaysAgo: 1 },
          { id: "req-202", service: "ceilingFanInstallation", completedDaysAgo: 3 },
          { id: "req-203", service: "heaterMaintenance", completedDaysAgo: 7 }
        ],
        favoriteWorkers: [
          { id: "worker-1", name: "Ahmed Fawzy", specialty: "acTechnician", rating: 4.9 },
          { id: "worker-2", name: "Youssef El-Sharif", specialty: "electrician", rating: 4.9 },
          { id: "worker-3", name: "Mostafa Adel", specialty: "plumber", rating: 4.8 }
        ]
      },
      "Client dashboard fetched"
    )
  );
});

router.get("/requests", (_request, response) => {
  response.status(200).json(
    successResponse(
      clientRequestRecords.map((item) => ({
        id: item.id,
        requestNumber: item.requestNumber,
        title: item.title,
        serviceId: item.serviceId,
        status: item.status,
        area: item.area,
        createdAt: item.createdAt
      })),
      "Client requests fetched"
    )
  );
});

router.get("/requests/:id", (request, response) => {
  const record = clientRequestRecords.find((item) => item.id === request.params.id);

  if (!record) {
    response.status(404).json({ success: false, message: "Request not found", error: "NOT_FOUND" });
    return;
  }

  response.status(200).json(successResponse(record, "Client request fetched"));
});

router.post("/requests", (request, response) => {
  const payload = parseBody(createRequestSchema, request.body);
  const nextNumber = clientRequestRecords.length + 104;
  const createdAt = new Date().toISOString();

  const record: ClientRequestRecord = {
    id: `req-${nextNumber}`,
    requestNumber: `OSTA-${nextNumber}`,
    categoryId: payload.categoryId,
    serviceId: payload.serviceId,
    title: payload.title,
    description: payload.description,
    mediaNotes: payload.mediaNotes ?? "",
    images: payload.images ?? [],
    voiceNote: payload.voiceNote,
    videoUrl: payload.videoUrl,
    address: payload.address,
    timing: payload.timing,
    status: "PENDING",
    area: getRequestArea(payload.address),
    createdAt,
    updatedAt: createdAt
  };

  clientRequestRecords.unshift(record);

  response.status(201).json(
    successResponse(
      {
        id: record.id,
        requestNumber: record.requestNumber,
        title: record.title,
        status: record.status,
        area: record.area,
        createdAt: record.createdAt,
        reviewEta: "Within 5 minutes"
      },
      "Client request created"
    )
  );
});

router.get("/favorites", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: {
          totalFavorites: favoriteWorkers.length,
          onlineNow: favoriteWorkers.filter((item) => item.availability === "Online now").length,
          avgRating: 4.9
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
