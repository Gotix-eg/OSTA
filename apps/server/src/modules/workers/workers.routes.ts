import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";

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

const incomingRequests: IncomingRequestRecord[] = [
  {
    id: "offer-1",
    service: "acMaintenance",
    urgency: "SAME_DAY",
    area: "newCairo",
    budgetMin: 350,
    budgetMax: 450,
    distanceKm: 2.4,
    freshnessMinutes: 6
  },
  {
    id: "offer-2",
    service: "electricalInspection",
    urgency: "NORMAL",
    area: "nasrCity",
    budgetMin: 250,
    budgetMax: 320,
    distanceKm: 4.1,
    freshnessMinutes: 14
  },
  {
    id: "offer-3",
    service: "faucetInstallation",
    urgency: "URGENT",
    area: "maadi",
    budgetMin: 220,
    budgetMax: 280,
    distanceKm: 3.2,
    freshnessMinutes: 4
  }
];

const activeRequests: ActiveRequestRecord[] = [
  {
    id: "active-1",
    service: "electricalRepair",
    status: "EN_ROUTE",
    clientName: "Mariam Hassan",
    area: "newCairo",
    scheduledWindow: "Today 2:00 PM - 3:00 PM",
    earnings: 320
  },
  {
    id: "active-2",
    service: "kitchenPlumbing",
    status: "ON_SITE",
    clientName: "Karim Adel",
    area: "maadi",
    scheduledWindow: "Today 3:30 PM - 5:00 PM",
    earnings: 410
  },
  {
    id: "active-3",
    service: "acMaintenance",
    status: "WRAP_UP",
    clientName: "Nour Emad",
    area: "nasrCity",
    scheduledWindow: "Today 5:30 PM - 6:30 PM",
    earnings: 480
  }
];

const workerRatings = {
  summary: {
    overallRating: 4.9,
    totalReviews: 312,
    repeatClientsRate: 41,
    fiveStars: 284
  },
  badges: ["Fast arrival", "Top-rated", "Trusted pro"],
  reviews: [
    {
      id: "review-1",
      clientName: "Sara Hassan",
      rating: 5,
      service: "AC maintenance",
      comment: "Very clean execution and fast arrival.",
      createdAt: "2026-03-26T16:00:00.000Z"
    },
    {
      id: "review-2",
      clientName: "Hany Mahmoud",
      rating: 5,
      service: "Electrical inspection",
      comment: "Clear communication and fair pricing.",
      createdAt: "2026-03-24T11:30:00.000Z"
    },
    {
      id: "review-3",
      clientName: "Mona Sherif",
      rating: 4,
      service: "Faucet installation",
      comment: "Good work and finished within the expected window.",
      createdAt: "2026-03-21T14:10:00.000Z"
    }
  ]
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

router.get("/dashboard", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: {
          incomingRequests: 8,
          incomingDelta: 2,
          activeJobs: 4,
          enRouteCount: 2,
          monthlyEarnings: 11240,
          monthlyGrowth: 18,
          rating: 4.9,
          ratingCount: 312
        },
        queue: [
          { id: "offer-1", service: "acMaintenance", area: "newCairo", budgetMin: 350, budgetMax: 450, freshness: "TODAY" },
          { id: "offer-2", service: "electricalInspection", area: "nasrCity", budgetMin: 250, budgetMax: 320, freshness: "TODAY" },
          { id: "offer-3", service: "faucetInstallation", area: "maadi", budgetMin: 220, budgetMax: 280, freshness: "TODAY" }
        ],
        weeklyLoad: [
          { day: "saturday", value: 90 },
          { day: "sunday", value: 70, tone: "dark" },
          { day: "monday", value: 82 },
          { day: "tuesday", value: 64, tone: "dark" }
        ],
        earningsPulse: {
          today: 46,
          week: 78,
          revenue: 88,
          satisfaction: 96
        },
        performance: {
          responseMinutes: 5,
          completionRate: 98,
          acceptanceRate: 96,
          repeatClients: 41
        }
      },
      "Worker dashboard fetched"
    )
  );
});

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

router.patch("/requests/:id/accept", (request, response) => {
  acceptRequestSchema.parse(request.body ?? {});
  const index = incomingRequests.findIndex((item) => item.id === request.params.id);

  if (index === -1) {
    response.status(404).json({ success: false, message: "Incoming request not found", error: "NOT_FOUND" });
    return;
  }

  const [item] = incomingRequests.splice(index, 1);

  if (!item) {
    response.status(404).json({ success: false, message: "Incoming request not found", error: "NOT_FOUND" });
    return;
  }

  activeRequests.unshift({
    id: `active-${item.id}`,
    service: item.service,
    status: "EN_ROUTE",
    clientName: "New Client",
    area: item.area,
    scheduledWindow: "Today 6:00 PM - 7:00 PM",
    earnings: Math.round((item.budgetMin + item.budgetMax) / 2)
  });

  response.status(200).json(
    successResponse(
      {
        summary: buildIncomingSummary(),
        requests: incomingRequests
      },
      "Worker request accepted"
    )
  );
});

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

router.patch("/requests/:id/complete", (request, response) => {
  const item = activeRequests.find((current) => current.id === request.params.id);

  if (!item) {
    response.status(404).json({ success: false, message: "Active request not found", error: "NOT_FOUND" });
    return;
  }

  item.status = "WRAP_UP";

  response.status(200).json(
    successResponse(
      {
        summary: buildActiveSummary(),
        requests: activeRequests
      },
      "Worker request moved to wrap up"
    )
  );
});

router.get("/earnings/summary", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        today: 1240,
        week: 4280,
        month: 11240,
        pendingWithdrawal: 1800,
        growth: 18,
        chart: [
          { label: "Week 1", amount: 2200 },
          { label: "Week 2", amount: 2640 },
          { label: "Week 3", amount: 2910 },
          { label: "Week 4", amount: 3490 }
        ],
        payouts: [
          { id: "payout-1", amount: 1800, status: "scheduled", date: "2026-03-31" },
          { id: "payout-2", amount: 4200, status: "paid", date: "2026-03-21" }
        ],
        transactions: [
          { id: "txn-1", label: "AC maintenance", type: "service", amount: 420 },
          { id: "txn-2", label: "Electrical inspection", type: "service", amount: 310 },
          { id: "txn-3", label: "Withdrawal", type: "withdrawal", amount: -1800 },
          { id: "txn-4", label: "Bonus payout", type: "bonus", amount: 250 }
        ]
      },
      "Worker earnings summary fetched"
    )
  );
});

router.get("/stats", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        responseTime: "5 mins",
        completionRate: 98,
        acceptanceRate: 96,
        repeatClients: 41
      },
      "Worker stats fetched"
    )
  );
});

router.get("/ratings", (_request, response) => {
  response.status(200).json(successResponse(workerRatings, "Worker ratings fetched"));
});

router.get("/settings", (_request, response) => {
  response.status(200).json(successResponse(workerSettings, "Worker settings fetched"));
});

export const workersRouter = router;
