import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { socketService } from "../../lib/socket.js";

const router = Router();

router.use(authenticate, requireRoles(UserRole.WORKER));

type WorkerServiceCode =
  | "electricalRepair"
  | "kitchenPlumbing"
  | "acMaintenance"
  | "electricalInspection"
  | "paintingRefresh"
  | "livingRoomPainting"
  | "ceilingFanInstallation"
  | "heaterMaintenance"
  | "faucetInstallation";

type WorkerAreaCode = "newCairo" | "nasrCity" | "maadi";

type IncomingRequestRecord = {
  id: string;
  service: WorkerServiceCode;
  urgency: "NORMAL" | "SAME_DAY" | "URGENT";
  area: WorkerAreaCode;
  budgetMin: number;
  budgetMax: number;
  distanceKm: number;
  freshnessMinutes: number;
};

type ActiveRequestRecord = {
  id: string;
  service: WorkerServiceCode;
  status: "EN_ROUTE" | "ON_SITE" | "WRAP_UP";
  clientName: string;
  area: WorkerAreaCode;
  scheduledWindow: string;
  earnings: number;
};

const incomingRequests: IncomingRequestRecord[] = [];

const activeRequests: ActiveRequestRecord[] = [];

const workerRatings = {
  summary: {
    overallRating: 0,
    totalReviews: 0,
    repeatClientsRate: 0,
    fiveStars: 0
  },
  badges: [],
  reviews: []
};

const workerSettings = {
  profile: {
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  },
  workPreferences: {
    isAvailable: false,
    acceptsEmergency: false,
    acceptsSameDay: false,
    serviceAreas: []
  },
  payout: {
    method: "",
    schedule: "",
    bankLabel: ""
  }
};

const ALLOWED_PAYMENT_METHODS = ["cash", "vodafone_cash", "instapay"] as const;

const acceptRequestSchema = z.object({
  workerName: z.string().min(2).max(80).optional(),
  price: z.number().optional()
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateFallbackDistance(requestAddress: { governorate: string; city: string; area: string | null }, workerAreas: Array<{ governorate: string; city: string; area: string | null }>): number {
  if (!workerAreas || workerAreas.length === 0) return 50; // no preference -> medium distance
  let bestDistance = 100; // default far distance
  for (const wa of workerAreas) {
    const govMatch = wa.governorate.toLowerCase().trim() === requestAddress.governorate.toLowerCase().trim();
    const cityMatch = wa.city.toLowerCase().trim() === requestAddress.city.toLowerCase().trim();
    const areaMatch = wa.area && requestAddress.area && wa.area.toLowerCase().trim() === requestAddress.area.toLowerCase().trim();
    
    if (govMatch && cityMatch && areaMatch) {
      bestDistance = Math.min(bestDistance, 1);
    } else if (govMatch && cityMatch) {
      bestDistance = Math.min(bestDistance, 5);
    } else if (govMatch) {
      bestDistance = Math.min(bestDistance, 15);
    }
  }
  return bestDistance;
}

function getCategorySlugsForProfession(profession: string | null | undefined): string[] {
  if (!profession) return [];
  const p = profession.toLowerCase().trim();
  if (p === "carpenter" || p === "نجار" || p.includes("نجار") || p.includes("carpentry")) return ["carpentry"];
  if (p === "plumber" || p === "سباك" || p.includes("سبا") || p.includes("plumb")) return ["plumbing"];
  if (p === "electrician" || p === "كهربائي" || p.includes("كهرب") || p.includes("elec")) return ["electricity", "electrical"];
  if (p === "ac-technician" || p === "تكييف" || p.includes("تكيي") || p.includes("ac")) return ["ac", "ac-technician"];
  if (p === "painter" || p === "نقاش" || p.includes("نقاش") || p.includes("دهان") || p.includes("paint")) return ["painting"];
  if (p === "aluminum" || p === "الوميتال" || p.includes("الوم") || p.includes("aluminum")) return ["aluminum"];
  if (p === "networks" || p === "شبكات" || p.includes("شبك") || p.includes("network")) return ["networks", "computer-networks"];
  if (p === "computer" || p === "كمبيوتر" || p.includes("كمبيو") || p.includes("computer")) return ["computer", "computer-repair"];
  if (p === "cctv" || p === "كاميرات" || p.includes("كامير") || p.includes("cctv")) return ["cctv", "camera-installation"];
  if (p === "appliances" || p === "أجهزة" || p.includes("جهز") || p.includes("appliance")) return ["appliances", "home-appliances"];
  if (p === "tiling" || p === "مبلط" || p.includes("مبلط") || p.includes("tile") || p.includes("tiling")) return ["tiling"];
  if (p === "plastering" || p === "محارة" || p.includes("محارة") || p.includes("plaster") || p.includes("plastering")) return ["plastering"];
  if (p === "ironwork" || p === "حداد" || p.includes("حداد") || p.includes("iron") || p.includes("ironwork")) return ["ironwork"];
  if (p === "finishing" || p === "تشطيب" || p.includes("تشطيب") || p.includes("finish") || p.includes("finishing")) return ["finishing"];
  if (p === "gypsum" || p === "جبس" || p.includes("جبس") || p.includes("gypsum")) return ["gypsum"];
  if (p === "moving" || p === "نقل" || p.includes("نقل") || p.includes("move") || p.includes("moving")) return ["moving"];
  if (p === "cleaning" || p === "نظافة" || p.includes("نظاف") || p.includes("clean") || p.includes("cleaning")) return ["cleaning"];
  if (p === "car-mechanic" || p === "سيارات" || p.includes("سيار") || p.includes("car")) return ["car-mechanic"];
  if (p === "bike-mechanic" || p === "موتوسيكلات" || p.includes("موتوسيك") || p.includes("bike")) return ["bike-mechanic"];
  if (p === "engine-repair" || p === "مواتير" || p.includes("موتور") || p.includes("engine")) return ["engine-repair"];
  return [];
}

function mapDbAreaToAreaCode(city: string): WorkerAreaCode {
  const c = city.toLowerCase();
  if (c.includes("nasr") || c.includes("نصر")) return "nasrCity";
  if (c.includes("maadi") || c.includes("معادي")) return "maadi";
  return "newCairo";
}

function mapDbServiceToServiceCode(serviceSlug: string): WorkerServiceCode {
  if (serviceSlug.includes("plumb")) return "kitchenPlumbing";
  if (serviceSlug.includes("elec") || serviceSlug.includes("volt")) return "electricalRepair";
  if (serviceSlug.includes("ac") || serviceSlug.includes("cool")) return "acMaintenance";
  if (serviceSlug.includes("paint")) return "paintingRefresh";
  if (serviceSlug.includes("fan")) return "ceilingFanInstallation";
  if (serviceSlug.includes("heat")) return "heaterMaintenance";
  if (serviceSlug.includes("faucet")) return "faucetInstallation";
  return "electricalRepair";
}

router.get("/dashboard", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const worker = await prisma.workerProfile.findUnique({
    where: { userId },
    include: { user: { select: { firstName: true } } }
  });

  if (!worker) throw new ApiError(404, "Worker profile not found");

  response.status(200).json(
    successResponse(
      {
        summary: {
          incomingRequests: 0,
          incomingDelta: 0,
          activeJobs: 0,
          enRouteCount: 0,
          monthlyEarnings: 0,
          monthlyGrowth: 0,
          rating: worker.rating,
          ratingCount: worker.ratingCount,
          orderQuota: worker.orderQuota,
          trialExpiresAt: worker.trialExpiresAt
        },
        queue: [],
        weeklyLoad: [
          { day: "saturday", value: 0 },
          { day: "sunday", value: 0, tone: "dark" },
          { day: "monday", value: 0 },
          { day: "tuesday", value: 0, tone: "dark" }
        ],
        earningsPulse: {
          today: 0,
          week: 0,
          revenue: 0,
          satisfaction: 0
        },
        performance: {
          responseMinutes: 0,
          completionRate: 0,
          acceptanceRate: 0,
          repeatClients: 0
        }
      },
      "Worker dashboard fetched"
    )
  );
}));

async function getIncomingRequestsForWorker(userId: string) {
  const worker = await prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      specializations: true,
      workAreas: true
    }
  });

  if (!worker) throw new ApiError(404, "Worker profile not found");

  const specServiceIds = worker.specializations.map(s => s.serviceId);
  const allowedCategories = getCategorySlugsForProfession(worker.profession);

  const reqs = await prisma.serviceRequest.findMany({
    where: {
      status: "PENDING",
      OR: [
        { workerId: worker.id },
        {
          workerId: null,
          OR: [
            { serviceId: { in: specServiceIds } },
            {
              service: {
                category: {
                  slug: { in: allowedCategories }
                }
              }
            }
          ]
        }
      ]
    },
    include: {
      service: {
        include: {
          category: true
        }
      },
      address: true,
      client: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  const mappedRequests = reqs.map(r => {
    let distanceKm = 10;
    if (
      worker.lastLocationLat !== null &&
      worker.lastLocationLng !== null &&
      r.address.latitude !== null &&
      r.address.longitude !== null
    ) {
      distanceKm = calculateDistance(
        worker.lastLocationLat,
        worker.lastLocationLng,
        r.address.latitude,
        r.address.longitude
      );
    } else {
      distanceKm = estimateFallbackDistance(r.address, worker.workAreas);
    }

    const freshnessMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(r.createdAt).getTime()) / 60000)
    );

    const budgetMin = r.estimatedPrice ? Math.round(r.estimatedPrice * 0.9) : (r.service.basePriceMin || 100);
    const budgetMax = r.estimatedPrice ? Math.round(r.estimatedPrice * 1.1) : (r.service.basePriceMax || 300);

    return {
      id: r.id,
      service: mapDbServiceToServiceCode(r.service.slug),
      urgency: (r.urgency === "EMERGENCY" ? "URGENT" : r.urgency) as "NORMAL" | "SAME_DAY" | "URGENT",
      area: mapDbAreaToAreaCode(r.address.city),
      budgetMin,
      budgetMax,
      distanceKm,
      freshnessMinutes,
      serviceNameAr: r.service.nameAr,
      serviceNameEn: r.service.nameEn,
      areaNameAr: r.address.area || r.address.city,
      areaNameEn: r.address.area || r.address.city,
      clientUserId: r.client?.user.id,
      clientName: r.client ? `${r.client.user.firstName} ${r.client.user.lastName}` : undefined
    };
  });

  mappedRequests.sort((a, b) => a.distanceKm - b.distanceKm);

  const availableNow = mappedRequests.length;
  const sameDay = mappedRequests.filter(item => item.urgency === "SAME_DAY").length;
  const emergency = mappedRequests.filter(item => item.urgency === "URGENT").length;
  const averageBudget =
    mappedRequests.length > 0
      ? Math.round(
          mappedRequests.reduce((total, item) => total + (item.budgetMin + item.budgetMax) / 2, 0) /
            mappedRequests.length
        )
      : 0;

  return {
    summary: {
      availableNow,
      sameDay,
      emergency,
      averageBudget
    },
    requests: mappedRequests
  };
}

async function getActiveRequestsForWorker(workerId: string) {
  const reqs = await prisma.serviceRequest.findMany({
    where: {
      workerId: workerId,
      status: {
        in: ["WORKER_EN_ROUTE", "IN_PROGRESS"]
      }
    },
    include: {
      client: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            }
          }
        }
      },
      address: true,
      service: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const resultRequests = reqs.map((r) => ({
    id: r.id,
    service: mapDbServiceToServiceCode(r.service.slug),
    status: (r.status === "WORKER_EN_ROUTE" ? "EN_ROUTE" : "ON_SITE") as "EN_ROUTE" | "ON_SITE" | "WRAP_UP",
    clientName: `${r.client.user.firstName} ${r.client.user.lastName}`,
    clientUserId: r.client.user.id,
    clientPhone: ["WORKER_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CONFIRMED_BY_CLIENT"].includes(r.status)
      ? r.client.user.phone
      : null,
    area: mapDbAreaToAreaCode(r.address.city),
    scheduledWindow: r.preferredTimeSlot || "Today",
    earnings: r.finalPrice || r.estimatedPrice || 150,
    serviceNameAr: r.service.nameAr,
    serviceNameEn: r.service.nameEn,
    areaNameAr: r.address.area || r.address.city,
    areaNameEn: r.address.area || r.address.city
  }));

  const summary = {
    activeJobs: resultRequests.length,
    enRoute: resultRequests.filter((item) => item.status === "EN_ROUTE").length,
    onSite: resultRequests.filter((item) => item.status === "ON_SITE").length,
    wrapUp: 0
  };

  return {
    summary,
    requests: resultRequests
  };
}

router.get("/requests/incoming", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const data = await getIncomingRequestsForWorker(userId);
  response.status(200).json(successResponse(data, "Incoming worker requests fetched"));
}));

router.get("/requests/active", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });

  if (!worker) throw new ApiError(404, "Worker profile not found");

  const data = await getActiveRequestsForWorker(worker.id);
  response.status(200).json(successResponse(data, "Active worker requests fetched"));
}));

router.patch("/requests/:id/accept", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const requestId = request.params.id as string;

  // 1. Get Worker Profile
  const worker = await prisma.workerProfile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!worker) throw new ApiError(404, "Worker profile not found");

  // 2. Subscription Gatekeeper
  const now = new Date();
  
  // Initialize trial if not set
  if (!worker.trialExpiresAt) {
    const trialDaysSetting = await prisma.systemSetting.findUnique({ where: { key: "worker_trial_days" } });
    const trialDays = parseInt(trialDaysSetting?.value ?? "30");
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDays);
    
    await prisma.workerProfile.update({
      where: { id: worker.id },
      data: { trialExpiresAt }
    });
    
    // Refresh worker object for the check below
    worker.trialExpiresAt = trialExpiresAt;
  }

  const inTrial = worker.trialExpiresAt && worker.trialExpiresAt > now;
  const hasQuota = worker.orderQuota > 0;

  if (!inTrial && !hasQuota) {
    throw new ApiError(403, "عذراً، يجب تجديد الباقة لتتمكن من قبول طلبات جديدة.");
  }

  // 3. Update Request Status & Price
  const payload = acceptRequestSchema.parse(request.body);
  const serviceRequest = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      workerId: worker.id,
      status: "WORKER_EN_ROUTE",
      finalPrice: payload.price || undefined,
      estimatedPrice: payload.price || undefined
    },
    include: {
      client: { include: { user: { select: { id: true, firstName: true } } } },
      service: { select: { nameAr: true } }
    }
  });

  // 4. Notify the client in real-time via WebSocket
  try {
    const clientUserId = serviceRequest.client?.user?.id;
    if (clientUserId) {
      socketService.sendNotification(clientUserId, {
        id: Math.random().toString(),
        title: "تم قبول طلبك! 🎉",
        body: `الفني ${worker.user.firstName} ${worker.user.lastName} قبل طلبك وهو في الطريق إليك.`,
        type: "REQUEST_ACCEPTED",
        data: { requestId, workerId: worker.id }
      });
    }
  } catch (notifyErr) {
    console.error("Failed to notify client:", notifyErr);
  }

  // 5. Return updated incoming requests list so UI refreshes
  const updatedIncoming = await getIncomingRequestsForWorker(userId);
  response.status(200).json(successResponse(updatedIncoming, "Worker request accepted"));
}));

router.patch("/requests/:id/budget", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  const requestId = request.params.id as string;
  const { price } = request.body as { price: number };
  if (!price || isNaN(price) || price <= 0) {
    throw new ApiError(400, "Valid price is required");
  }

  const record = await prisma.serviceRequest.findFirst({
    where: { id: requestId, workerId: worker.id }
  });
  if (!record) throw new ApiError(404, "Request not found or not assigned to you");

  if (["COMPLETED", "CONFIRMED_BY_CLIENT", "CANCELLED_BY_CLIENT", "CANCELLED_BY_WORKER"].includes(record.status)) {
    throw new ApiError(400, "Cannot edit budget for completed or cancelled requests");
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: {
      finalPrice: price,
      estimatedPrice: price
    }
  });

  response.status(200).json(successResponse(updated, "Request budget updated"));
}));

router.patch("/requests/:id/reject", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const requestId = request.params.id as string;
  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (worker) {
    const req = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (req && req.workerId === worker.id && req.status === "PENDING") {
      await prisma.serviceRequest.update({
        where: { id: requestId },
        data: { workerId: null }
      });
    }
  }

  const data = await getIncomingRequestsForWorker(userId);
  response.status(200).json(successResponse(data, "Worker request rejected"));
}));

router.patch("/requests/:id/start", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const requestId = request.params.id as string;
  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  await prisma.serviceRequest.updateMany({
    where: { id: requestId, workerId: worker.id },
    data: { status: "IN_PROGRESS" }
  });

  const data = await getActiveRequestsForWorker(worker.id);
  response.status(200).json(successResponse(data, "Worker request started"));
}));

router.patch("/requests/:id/complete", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const requestId = request.params.id;

  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: requestId as string, workerId: worker.id }
  });

  if (!serviceRequest) throw new ApiError(404, "Request not found or not assigned to you");

  // 1. Update request status
  const completedRequest = await prisma.serviceRequest.update({
    where: { id: requestId as string },
    data: { status: "COMPLETED" },
    include: {
      client: { include: { user: { select: { id: true, firstName: true } } } },
      service: { select: { nameAr: true } }
    }
  });

  // 2. Deduct quota if trial is expired
  const now = new Date();
  const inTrial = worker.trialExpiresAt && worker.trialExpiresAt > now;

  if (!inTrial && worker.orderQuota > 0) {
    await prisma.workerProfile.update({
      where: { id: worker.id },
      data: { orderQuota: { decrement: 1 } }
    });
  }

  // 3. Notify the client that the job is completed
  try {
    const clientUserId = completedRequest.client?.user?.id;
    if (clientUserId) {
      socketService.sendNotification(clientUserId, {
        id: Math.random().toString(),
        title: "اكتملت الخدمة ✅",
        body: `انتهى الفني من إنجاز خدمة ${completedRequest.service?.nameAr || 'الصيانة'}. يرجى تأكيد الاستلام.`,
        type: "REQUEST_COMPLETED",
        data: { requestId: completedRequest.id }
      });
    }
  } catch (notifyErr) {
    console.error("Failed to notify client on complete:", notifyErr);
  }

  // 4. Return updated active requests for UI refresh
  const updatedActive = await getActiveRequestsForWorker(worker.id);
  response.status(200).json(successResponse(updatedActive, "Worker request completed and quota updated"));
}));

router.get("/earnings/summary", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        today: 0,
        week: 0,
        month: 0,
        pendingWithdrawal: 0,
        growth: 0,
        chart: [],
        payouts: [],
        transactions: []
      },
      "Worker earnings summary fetched"
    )
  );
});

router.get("/stats", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        responseTime: "0 mins",
        completionRate: 0,
        acceptanceRate: 0,
        repeatClients: 0
      },
      "Worker stats fetched"
    )
  );
});

router.get("/ratings", (_request, response) => {
  response.status(200).json(successResponse(workerRatings, "Worker ratings fetched"));
});

router.get("/settings", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workerProfile: {
        include: {
          workAreas: true
        }
      }
    }
  });

  if (!user) throw new ApiError(404, "User not found");

  const dbServiceAreas = user.workerProfile?.workAreas?.map(
    (wa) => wa.area || wa.city || wa.governorate
  ) ?? [];

  const settings = {
    ...workerSettings,
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      nationalIdNumber: user.workerProfile?.nationalIdNumber ?? null,
      nationalIdFront: user.workerProfile?.nationalIdFront ?? null,
      nationalIdBack: user.workerProfile?.nationalIdBack ?? null,
      selfieWithId: user.workerProfile?.selfieWithId ?? null,
      verificationStatus: user.workerProfile?.verificationStatus ?? "PENDING"
    },
    workPreferences: {
      ...workerSettings.workPreferences,
      isAvailable: user.workerProfile?.isAvailable ?? false,
      notificationsEnabledApp: user.workerProfile?.notificationsEnabledApp ?? true,
      notificationsEnabledEmail: user.workerProfile?.notificationsEnabledEmail ?? true,
      subscriptionTier: user.workerProfile?.subscriptionTier ?? "free",
      workingHours: user.workerProfile?.workingHours ?? null,
      offDates: user.workerProfile?.offDates ?? [],
      acceptedPaymentMethods: user.workerProfile?.acceptedPaymentMethods ?? [],
      preferredPaymentMethod: user.workerProfile?.preferredPaymentMethod ?? null,
      serviceAreas: dbServiceAreas.length ? dbServiceAreas : (workerSettings.workPreferences.serviceAreas ?? [])
    }
  };

  response.status(200).json(successResponse(settings, "Worker settings fetched"));
}));

router.patch("/settings", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const { notificationsEnabledApp, notificationsEnabledEmail, isAvailable, nationalIdNumber, nationalIdFront, nationalIdBack, selfieWithId, workingHours, offDates, acceptedPaymentMethods, preferredPaymentMethod, serviceAreas } = request.body;

  if (acceptedPaymentMethods !== undefined) {
    if (!Array.isArray(acceptedPaymentMethods) || acceptedPaymentMethods.some((method: unknown) => !ALLOWED_PAYMENT_METHODS.includes(method as any))) {
      throw new ApiError(400, "Invalid payment method");
    }
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId }
  });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  if (preferredPaymentMethod !== undefined && preferredPaymentMethod !== null) {
    if (!ALLOWED_PAYMENT_METHODS.includes(preferredPaymentMethod as any)) {
      throw new ApiError(400, "Invalid preferred payment method");
    }
    const effectiveAcceptedMethods: string[] = acceptedPaymentMethods !== undefined ? acceptedPaymentMethods : worker.acceptedPaymentMethods;
    if (!effectiveAcceptedMethods.includes(preferredPaymentMethod)) {
      throw new ApiError(400, "Preferred payment method must be one of the accepted methods");
    }
  }

  if (serviceAreas !== undefined && Array.isArray(serviceAreas)) {
    await prisma.workerArea.deleteMany({
      where: { workerId: worker.id }
    });
    if (serviceAreas.length > 0) {
      await prisma.workerArea.createMany({
        data: serviceAreas.map((areaStr: string) => {
          const name = String(areaStr).trim();
          const parts = name.split("-").map((s) => s.trim());
          if (parts.length >= 2) {
            return {
              workerId: worker.id,
              governorate: parts[0] || "القاهرة",
              city: parts[1] || parts[0] || "القاهرة",
              area: parts[2] || parts[1] || parts[0] || "القاهرة"
            };
          }
          return {
            workerId: worker.id,
            governorate: name || "القاهرة",
            city: name || "القاهرة",
            area: name || "القاهرة"
          };
        })
      });
    }
  }

  const updated = await prisma.workerProfile.update({
    where: { id: worker.id },
    data: {
      notificationsEnabledApp: notificationsEnabledApp !== undefined ? !!notificationsEnabledApp : undefined,
      notificationsEnabledEmail: notificationsEnabledEmail !== undefined ? !!notificationsEnabledEmail : undefined,
      isAvailable: isAvailable !== undefined ? !!isAvailable : undefined,
      nationalIdNumber: nationalIdNumber !== undefined ? nationalIdNumber : undefined,
      nationalIdFront: nationalIdFront !== undefined ? nationalIdFront : undefined,
      nationalIdBack: nationalIdBack !== undefined ? nationalIdBack : undefined,
      selfieWithId: selfieWithId !== undefined ? selfieWithId : undefined,
      workingHours: workingHours !== undefined ? workingHours : undefined,
      offDates: offDates !== undefined ? offDates : undefined,
      acceptedPaymentMethods: acceptedPaymentMethods !== undefined ? acceptedPaymentMethods : undefined,
      preferredPaymentMethod: preferredPaymentMethod !== undefined ? preferredPaymentMethod : undefined
    }
  });

  response.status(200).json(successResponse(updated, "Worker settings updated successfully"));
}));

router.get("/profile", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      certificates: { orderBy: { order: "asc" } },
      serviceItems: { orderBy: { order: "asc" } }
    }
  });

  if (!worker) throw new ApiError(404, "Worker profile not found");

  const profile = {
    bio: worker.bio ?? "",
    yearsOfExperience: worker.yearsOfExperience,
    education: worker.education,
    achievements: worker.achievements,
    galleryImages: worker.galleryImages,
    galleryVideoUrl: worker.galleryVideoUrl ?? "",
    contractInfo: worker.contractInfo ?? "",
    certificates: worker.certificates.map((c) => ({ id: c.id, title: c.title, year: c.year ?? "", imageUrl: c.imageUrl })),
    serviceItems: worker.serviceItems.map((s) => ({ id: s.id, name: s.name, price: s.price, note: s.note ?? "" }))
  };

  response.status(200).json(successResponse(profile, "Worker profile fetched"));
}));

const workerProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  yearsOfExperience: z.number().int().min(0).max(80).optional(),
  education: z.array(z.string().max(300)).max(20).optional(),
  achievements: z.array(z.string().max(300)).max(20).optional(),
  galleryImages: z.array(z.string().url().max(1000)).max(24).optional(),
  galleryVideoUrl: z.string().max(1000).optional(),
  contractInfo: z.string().max(2000).optional(),
  certificates: z.array(z.object({
    title: z.string().min(1).max(200),
    year: z.string().max(20).optional(),
    imageUrl: z.string().url().max(1000)
  })).max(20).optional(),
  serviceItems: z.array(z.object({
    name: z.string().min(1).max(200),
    price: z.string().min(1).max(60).refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.trim()) || /^\d+(\.\d{1,2})?\s*(ج\.م|EGP)$/i.test(val.trim()),
      { message: "السعر يجب أن يكون رقماً بالجنيه المصري (مثال: 150)" }
    ),
    note: z.string().max(300).optional()
  })).max(40).optional()
});

router.patch("/profile", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const body = workerProfileSchema.parse(request.body);

  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  await prisma.$transaction(async (tx) => {
    await tx.workerProfile.update({
      where: { id: worker.id },
      data: {
        bio: body.bio !== undefined ? body.bio.trim() || null : undefined,
        yearsOfExperience: body.yearsOfExperience,
        education: body.education?.map((e) => e.trim()).filter(Boolean),
        achievements: body.achievements?.map((a) => a.trim()).filter(Boolean),
        galleryImages: body.galleryImages,
        galleryVideoUrl: body.galleryVideoUrl !== undefined ? body.galleryVideoUrl.trim() || null : undefined,
        contractInfo: body.contractInfo !== undefined ? body.contractInfo.trim() || null : undefined
      }
    });

    if (body.certificates !== undefined) {
      await tx.workerCertificate.deleteMany({ where: { workerId: worker.id } });
      if (body.certificates.length > 0) {
        await tx.workerCertificate.createMany({
          data: body.certificates.map((c, index) => ({
            workerId: worker.id,
            title: c.title.trim(),
            year: c.year?.trim() || null,
            imageUrl: c.imageUrl,
            order: index
          }))
        });
      }
    }

    if (body.serviceItems !== undefined) {
      await tx.workerServiceItem.deleteMany({ where: { workerId: worker.id } });
      if (body.serviceItems.length > 0) {
        await tx.workerServiceItem.createMany({
          data: body.serviceItems.map((s, index) => ({
            workerId: worker.id,
            name: s.name.trim(),
            price: s.price.trim(),
            note: s.note?.trim() || null,
            order: index
          }))
        });
      }
    }
  });

  const updated = await prisma.workerProfile.findUnique({
    where: { id: worker.id },
    include: {
      certificates: { orderBy: { order: "asc" } },
      serviceItems: { orderBy: { order: "asc" } }
    }
  });

  response.status(200).json(successResponse(updated, "Worker profile updated successfully"));
}));

export const workersRouter = router;
