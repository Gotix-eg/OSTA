import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { catchAsync } from "../../utils/catchAsync.js";

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
    firstName: "Youssef",
    lastName: "Mahmoud",
    phone: "+201055555555",
    email: "youssef.worker@osta.eg"
  },
  workPreferences: {
    isAvailable: true,
    acceptsEmergency: true,
    acceptsSameDay: true,
    serviceAreas: ["New Cairo", "Nasr City", "Maadi"]
  },
  payout: {
    method: "Bank transfer",
    schedule: "Weekly",
    bankLabel: "National Bank ending 2241"
  }
};

const acceptRequestSchema = z.object({
  workerName: z.string().min(2).max(80).optional()
});

function buildIncomingSummary() {
  const sameDay = incomingRequests.filter((item) => item.urgency === "SAME_DAY").length;
  const emergency = incomingRequests.filter((item) => item.urgency === "URGENT").length;
  const averageBudget =
    incomingRequests.length > 0
      ? Math.round(
          incomingRequests.reduce((total, item) => total + (item.budgetMin + item.budgetMax) / 2, 0) / incomingRequests.length
        )
      : 0;

  return {
    availableNow: incomingRequests.length,
    sameDay,
    emergency,
    averageBudget
  };
}

function buildActiveSummary() {
  return {
    activeJobs: activeRequests.length,
    enRoute: activeRequests.filter((item) => item.status === "EN_ROUTE").length,
    onSite: activeRequests.filter((item) => item.status === "ON_SITE").length,
    wrapUp: activeRequests.filter((item) => item.status === "WRAP_UP").length
  };
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

router.get("/requests/incoming", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: buildIncomingSummary(),
        requests: incomingRequests
      },
      "Incoming worker requests fetched"
    )
  );
});

router.get("/requests/active", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: buildActiveSummary(),
        requests: activeRequests
      },
      "Active worker requests fetched"
    )
  );
});

router.patch("/requests/:id/accept", catchAsync(async (request, response) => {
  const userId = request.auth!.userId;
  const requestId = request.params.id;

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

  // 3. Update Request Status
  const serviceRequest = await prisma.serviceRequest.update({
    where: { id: requestId as string },
    data: {
      workerId: worker.id,
      status: "WORKER_EN_ROUTE"
    }
  });

  response.status(200).json(
    successResponse(
      serviceRequest,
      "Worker request accepted"
    )
  );
}));

router.patch("/requests/:id/reject", (request, response) => {
  const index = incomingRequests.findIndex((item) => item.id === request.params.id);

  if (index === -1) {
    response.status(404).json({ success: false, message: "Incoming request not found", error: "NOT_FOUND" });
    return;
  }

  incomingRequests.splice(index, 1);

  response.status(200).json(
    successResponse(
      {
        summary: buildIncomingSummary(),
        requests: incomingRequests
      },
      "Worker request rejected"
    )
  );
});

router.patch("/requests/:id/start", (request, response) => {
  const item = activeRequests.find((current) => current.id === request.params.id);

  if (!item) {
    response.status(404).json({ success: false, message: "Active request not found", error: "NOT_FOUND" });
    return;
  }

  item.status = "ON_SITE";

  response.status(200).json(
    successResponse(
      {
        summary: buildActiveSummary(),
        requests: activeRequests
      },
      "Worker request started"
    )
  );
});

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
  await prisma.serviceRequest.update({
    where: { id: requestId as string },
    data: { status: "COMPLETED" }
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

  response.status(200).json(
    successResponse(
      null,
      "Worker request completed and quota updated"
    )
  );
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
  });

  if (!user) throw new ApiError(404, "User not found");

  const settings = {
    ...workerSettings,
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email
    }
  };

  response.status(200).json(successResponse(settings, "Worker settings fetched"));
}));

export const workersRouter = router;
