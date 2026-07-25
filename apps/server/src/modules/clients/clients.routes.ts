import { randomInt } from "node:crypto";
import { Router, Request, Response } from "express";
import { UserRole } from "@prisma/client";

import { ZodError, z } from "zod";

import {
  authenticate,
  requireRoles,
} from "../../middleware/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendAppNotification } from "../../utils/notification.util.js";
import { sendNewRequestNotificationEmail } from "../../utils/email.js";
import { isWorkerAvailableNow } from "../../utils/worker-availability.util.js";

const router = Router();

router.use(authenticate, requireRoles(UserRole.CLIENT));

const requestStatusSchema = z.enum([
  "PENDING",
  "WORKER_EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
]);

const createRequestSchema = z.object({
  categoryId: z.string().min(1),
  serviceId: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1200),
  mediaNotes: z.string().max(500).optional(),
  workerId: z.string().optional(),
  address: z
    .object({
      mode: z.enum(["saved", "new"]),
      savedAddressId: z.string().optional(),
      governorate: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      street: z.string().optional(),
    })
    .superRefine((value, context) => {
      if (value.mode === "saved" && !value.savedAddressId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["savedAddressId"],
          message: "Saved address is required",
        });
      }

      if (value.mode === "new") {
        for (const key of [
          "governorate",
          "city",
          "district",
          "street",
        ] as const) {
          if (!value[key]) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: [key],
              message: `${key} is required`,
            });
          }
        }
      }
    }),
  timing: z
    .object({
      type: z.enum(["emergency", "today", "tomorrow", "custom"]),
      customDate: z.string().optional(),
      customWindow: z.string().optional(),
    })
    .superRefine((value, context) => {
      if (
        value.type === "custom" &&
        (!value.customDate || !value.customWindow)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customDate"],
          message: "Custom date and window are required",
        });
      }
    }),
  images: z.array(z.string()).optional(),
  voiceNote: z.string().optional(),
  videoUrl: z.string().optional(),
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

function parseBody<T>(
  schema: { parse: (value: unknown) => T },
  body: unknown,
): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(
        400,
        "Validation failed",
        JSON.stringify(error.flatten().fieldErrors),
      );
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

router.get(
  "/dashboard",
  catchAsync(async (request: Request, response: Response) => {
    const userId = request.auth!.userId;
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    // Fetch real sub-summaries (Mocked for UI structure but using some real data)
    const totalRequests = await prisma.serviceRequest.count({
      where: { clientId: profile.id },
    });

    // Real Worker Discovery (The User's core request)
    // Logic: Active trial OR quota, VERIFIED, sorted by Rating
    const now = new Date();
    const eligibleWorkers = await prisma.workerProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        OR: [{ trialExpiresAt: { gt: now } }, { orderQuota: { gt: 0 } }],
      },
      orderBy: {
        rating: "desc",
      },
      take: 5,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const activeRequests = await prisma.serviceRequest.findMany({
      where: {
        clientId: profile.id,
        status: { in: ["WORKER_EN_ROUTE", "IN_PROGRESS"] },
      },
      include: { worker: { include: { user: true } } },
    });

    response.status(200).json(
      successResponse(
        {
          summary: {
            totalRequests,
            totalRequestsDelta: 0,
            activeRequests: activeRequests.length,
            enRouteCount: activeRequests.filter(
              (r) => r.status === "WORKER_EN_ROUTE",
            ).length,
            activeWarranties: 0,
            walletBalance: profile.walletBalance, // Standardized
          },
          activeRequests: activeRequests.map((r) => ({
            id: r.id,
            service: r.serviceId,
            status: r.status,
            workerName: r.worker
              ? `${r.worker.user.firstName} ${r.worker.user.lastName}`
              : "Pending",
            etaMinutes: 15, // Mocked ETA
            area: "newCairo",
          })),
          suggestedServices: [
            "acMaintenance",
            "electricalInspection",
            "paintingRefresh",
          ],
          recentCompleted: [],
          favoriteWorkers: eligibleWorkers.map((w) => ({
            id: w.id,
            name: `${w.user.firstName} ${w.user.lastName}`,
            specialty: "electrician", // Should be mapped from WorkerSpecialization
            rating: w.rating,
          })),
        },
        "Client dashboard fetched",
      ),
    );
  }),
);

router.get(
  "/requests",
  catchAsync(async (request: Request, response: Response) => {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    const reqs = await prisma.serviceRequest.findMany({
      where: { clientId: profile.id },
      include: {
        service: { select: { nameAr: true, nameEn: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    response.status(200).json(
      successResponse(
        reqs.map((item: any) => ({
          id: item.id,
          requestNumber: item.requestNumber,
          title: item.title,
          serviceId: item.serviceId,
          serviceNameAr: item.service?.nameAr || item.serviceId,
          serviceNameEn: item.service?.nameEn || item.serviceId,
          status: item.status,
          area: item.address ? item.address.city : "Unknown",
          createdAt: item.createdAt,
        })),
        "Client requests fetched",
      ),
    );
  }),
);

router.get(
  "/requests/:id",
  catchAsync(async (request: Request, response: Response) => {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");
    const { id } = request.params as { id: string };

    const record = await prisma.serviceRequest.findFirst({
      where: { id, clientId: profile.id },
      include: {
        service: true,
        address: true,
        worker: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      throw new ApiError(404, "Request not found");
    }

    const mapped = {
      id: record.id,
      requestNumber: record.requestNumber,
      title: record.title,
      description: record.description,
      status: record.status,
      area: record.address?.area || record.address?.city || "Unknown",
      serviceId: record.serviceId,
      serviceNameAr: record.service?.nameAr || record.serviceId,
      serviceNameEn: record.service?.nameEn || record.serviceId,
      timing: {
        type: record.urgency === "EMERGENCY" ? "emergency" : "today",
        customWindow: record.preferredTimeSlot || undefined,
      },
      address: {
        mode: "new",
        governorate: record.address?.governorate || "Unknown",
        city: record.address?.city || "Unknown",
        district: record.address?.area || "Unknown",
        street: record.address?.street || "Unknown",
        lat: record.address?.latitude || 0,
        lng: record.address?.longitude || 0,
      },
      mediaNotes: record.voiceNote || "",
      images: record.images || [],
      estimatedPrice: record.estimatedPrice,
      finalPrice: record.finalPrice,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      worker: record.worker ? {
        id: record.worker.id,
        userId: record.worker.user.id,
        name: `${record.worker.user.firstName} ${record.worker.user.lastName}`,
        avatarUrl: record.worker.user.avatarUrl,
        rating: record.worker.rating,
        phone: ["WORKER_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CONFIRMED_BY_CLIENT"].includes(record.status)
          ? record.worker.user.phone
          : null,
      } : null,
    };

    response
      .status(200)
      .json(successResponse(mapped, "Client request fetched"));
  }),
);

router.patch(
  "/requests/:id/budget",
  catchAsync(async (request: Request, response: Response) => {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");
    
    const { id } = request.params as { id: string };
    const { price } = request.body as { price: number };
    if (!price || isNaN(price) || price <= 0) {
      throw new ApiError(400, "Valid price is required");
    }

    const record = await prisma.serviceRequest.findFirst({
      where: { id, clientId: profile.id },
    });
    if (!record) throw new ApiError(404, "Request not found");

    if (["COMPLETED", "CONFIRMED_BY_CLIENT", "CANCELLED_BY_CLIENT", "CANCELLED_BY_WORKER"].includes(record.status)) {
      throw new ApiError(400, "Cannot edit budget for completed or cancelled requests");
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        estimatedPrice: price,
        finalPrice: record.status !== "PENDING" ? price : undefined,
      },
    });

    response.status(200).json(successResponse(updated, "Request budget updated"));
  })
);

router.post(
  "/requests",
  catchAsync(async (request: Request, response: Response) => {
    const payload = parseBody(createRequestSchema, request.body);

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");
    const clientId = profile.id;

    const service = await prisma.service.findUnique({
      where: { id: payload.serviceId },
      include: { category: true },
    });
    if (!service || !service.isActive || !service.category.isActive) {
      throw new ApiError(400, "Invalid or inactive service");
    }

    let addressId = payload.address.savedAddressId;
    let requestAddress;
    if (payload.address.mode === "new" || !addressId) {
      const newAddress = await prisma.address.create({
        data: {
          userId: request.auth!.userId,
          governorate: payload.address.governorate!,
          city: payload.address.city!,
          area: payload.address.district!,
          street: payload.address.street!,
          label: "New Address",
        },
      });
      addressId = newAddress.id;
      requestAddress = newAddress;
    } else {
      requestAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: request.auth!.userId,
        },
      });
      if (!requestAddress) {
        throw new ApiError(400, "Invalid address");
      }
    }

    let preferredDate: Date | null = null;
    if (payload.timing.type === "today") preferredDate = new Date();
    if (payload.timing.type === "tomorrow") {
      preferredDate = new Date();
      preferredDate.setDate(preferredDate.getDate() + 1);
    }
    if (payload.timing.type === "custom" && payload.timing.customDate) {
      preferredDate = new Date(payload.timing.customDate);
    }

    if (payload.workerId) {
      const directWorker = await prisma.workerProfile.findFirst({
        where: {
          id: payload.workerId,
          verificationStatus: "VERIFIED",
          specializations: {
            some: {
              serviceId: service.id,
            },
          },
          workAreas: {
            some: {
              governorate: requestAddress.governorate,
              city: requestAddress.city,
              OR: [
                { area: null },
                { area: requestAddress.area },
              ],
            },
          },
        },
      });
      if (!directWorker) {
        throw new ApiError(400, "Selected worker is not eligible for this service and location");
      }
    }

    let requestNumber = "";
    while (true) {
      const candidate = String(randomInt(10000000, 100000000));
      const existing = await prisma.serviceRequest.findUnique({
        where: { requestNumber: candidate },
      });
      if (!existing) {
        requestNumber = candidate;
        break;
      }
    }

    const record = await prisma.serviceRequest.create({
      data: {
        clientId,
        requestNumber,
        serviceId: service.id,
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
        workerId: payload.workerId || undefined,
      },
    });

    // Automatically add to favorites for direct booking
    if (payload.workerId) {
      try {
        await prisma.favoriteWorker.upsert({
          where: {
            clientId_workerId: {
              clientId,
              workerId: payload.workerId,
            },
          },
          update: {},
          create: {
            clientId,
            workerId: payload.workerId,
          },
        });
      } catch (favErr) {
        console.error("Auto-favorite failed: ", favErr);
      }
    }

    // System notification for the client
    await prisma.notification.create({
      data: {
        userId: request.auth!.userId,
        type: "SYSTEM",
        title: "تم استلام الطلب",
        body: `تم استلام طلب الصيانة الخاص بك (${record.requestNumber}) وجاري البحث عن فني مناسب.`,
      },
    });

    // Notify suitable workers who cover the location and match the specialization
    try {
      const requestAddress = await prisma.address.findUnique({
        where: { id: record.addressId }
      });

      if (requestAddress) {
        let workersToNotify: any[] = [];

        if (payload.workerId) {
          const directWorker = await prisma.workerProfile.findUnique({
            where: { id: payload.workerId },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          });
          if (directWorker) workersToNotify.push(directWorker);
        } else {
          workersToNotify = await prisma.workerProfile.findMany({
            where: {
              verificationStatus: "VERIFIED",
              specializations: {
                some: {
                  serviceId: record.serviceId
                }
              },
              workAreas: {
                some: {
                  governorate: requestAddress.governorate,
                  city: requestAddress.city
                }
              }
            },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          });
        }

        const serviceCategory = await prisma.service.findUnique({
          where: { id: record.serviceId },
          include: { category: true }
        });
        const categoryName = serviceCategory?.category.nameAr || serviceCategory?.category.nameEn || "صيانة";

        for (const worker of workersToNotify) {
          const isPremium = worker.subscriptionTier !== "free" || (worker.trialExpiresAt && worker.trialExpiresAt > new Date());
          
          // 1. App Notification
          if (worker.notificationsEnabledApp && isPremium) {
            await sendAppNotification({
              userId: worker.user.id,
              type: "CUSTOM_REQUEST_NEW",
              title: "طلب صيانة جديد متاح 🛠️",
              body: `تم إضافة طلب جديد في تخصصك: ${categoryName} بموقعك.`,
              data: { requestId: record.id }
            });
          }

          // 2. Email Notification
          if (worker.notificationsEnabledEmail && worker.user.email && isPremium) {
            await sendNewRequestNotificationEmail(
              worker.user.email,
              `${worker.user.firstName} ${worker.user.lastName}`,
              record.title,
              categoryName,
              `${requestAddress.governorate}، ${requestAddress.city}`
            );
          }
        }
      }
    } catch (notifyErr) {
      console.error("Failed to notify suitable workers:", notifyErr);
    }

    response.status(201).json(
      successResponse(
        {
          id: record.id,
          requestNumber: record.requestNumber,
          title: record.title,
          status: record.status,
          createdAt: record.createdAt,
          reviewEta: "Within 5 minutes",
        },
        "Client request created",
      ),
    );
  }),
);

router.get(
  "/favorites",
  catchAsync(async (request: Request, response: Response) => {
    const userId = request.auth!.userId;
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    const favorites = await prisma.favoriteWorker.findMany({
      where: { clientId: profile.id },
      include: {
        worker: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specializations: { include: { service: true } },
            workAreas: true,
          },
        },
      },
    });

    const favoritesAvailability = favorites.map((f) =>
      isWorkerAvailableNow({
        isAvailable: f.worker.isAvailable,
        workingHours: f.worker.workingHours,
        offDates: f.worker.offDates,
      }),
    );

    response.status(200).json(
      successResponse(
        {
          summary: {
            totalFavorites: favorites.length,
            onlineNow: favoritesAvailability.filter(Boolean).length,
            avgRating:
              favorites.length > 0
                ? favorites.reduce(
                    (sum, f) => sum + (f.worker.rating || 0),
                    0,
                  ) / favorites.length
                : 0,
          },
          workers: favorites.map((f, i) => ({
            id: f.worker.id,
            name: `${f.worker.user.firstName} ${f.worker.user.lastName}`,
            specialty: f.worker.specializations[0]?.service.nameEn || "general",
            rating: f.worker.rating,
            completedJobs: f.worker.totalJobsCompleted,
            area: f.worker.workAreas[0]?.area || "Unknown",
            availability: favoritesAvailability[i] ? "available" : "busy",
          })),
        },
        "Favorite workers fetched",
      ),
    );
  }),
);

router.get(
  "/wallet",
  catchAsync(async (request: Request, response: Response) => {
    const userId = request.auth!.userId;
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    // Get recent transactions (last 10)
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate monthly spend (sum of payments/expenses this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySpend = await prisma.walletTransaction.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
        type: { in: ["payment", "order"] }, // Adjust based on your transaction types
      },
      _sum: { amount: true },
    });

    const pendingRefunds = await prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: "refund",
      },
      _sum: { amount: true },
    });

    response.status(200).json(
      successResponse(
        {
          balance: profile.walletBalance,
          currency: "EGP",
          spendThisMonth: monthlySpend._sum.amount || 0,
          pendingRefunds: pendingRefunds._sum.amount || 0,
          paymentMethods: [], // TODO: fetch from payment_methods table if exists
          recentTransactions: transactions.map((t) => ({
            id: t.id,
            type: t.type as "topup" | "payment" | "refund",
            amount: t.amount,
            label: t.description || t.type,
            createdAt: t.createdAt.toISOString(),
          })),
        },
        "Wallet fetched",
      ),
    );
  }),
);

router.get(
  "/settings",
  catchAsync(async (request: Request, response: Response) => {
    const userId = request.auth!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        preferredLanguage: true,
      },
    });
    if (!user) throw new ApiError(404, "User not found");

    const addresses = await prisma.address.findMany({
      where: { userId },
      select: {
        id: true,
        label: true,
        isDefault: true,
        governorate: true,
        city: true,
        area: true,
        street: true,
      },
    });

    response.status(200).json(
      successResponse(
        {
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || "",
            phone: user.phone,
            avatarUrl: user.avatarUrl,
          },
          preferences: {
            language: user.preferredLanguage || "ar",
            notificationsBySms: false, // TODO: add to user/client profile if needed
            notificationsByEmail: false,
            marketingUpdates: false,
          },
          addresses,
        },
        "Client settings fetched",
      ),
    );
  }),
);

router.post(
  "/favorites",
  catchAsync(async (request: Request, response: Response) => {
    const { workerId } = request.body as { workerId: string };
    if (!workerId) throw new ApiError(400, "Worker ID is required");

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    const existing = await prisma.favoriteWorker.findUnique({
      where: {
        clientId_workerId: {
          clientId: profile.id,
          workerId
        }
      }
    });

    if (existing) {
      return response.status(200).json(successResponse(existing, "Worker already in favorites"));
    }

    const favorite = await prisma.favoriteWorker.create({
      data: {
        clientId: profile.id,
        workerId
      }
    });

    response.status(201).json(successResponse(favorite, "Worker added to favorites"));
  })
);

router.delete(
  "/favorites/:workerId",
  catchAsync(async (request: Request, response: Response) => {
    const { workerId } = request.params as { workerId: string };
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: request.auth!.userId },
    });
    if (!profile) throw new ApiError(404, "Client profile not found");

    await prisma.favoriteWorker.delete({
      where: {
        clientId_workerId: {
          clientId: profile.id,
          workerId
        }
      }
    });

    response.status(200).json(successResponse(null, "Worker removed from favorites"));
  })
);

export const clientsRouter = router;
