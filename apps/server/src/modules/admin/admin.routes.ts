import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";

const router = Router();

router.use(authenticate, requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

type VerificationStatus = "UNDER_REVIEW" | "DOCUMENTS_SUBMITTED" | "AWAITING_ID" | "VERIFIED" | "REJECTED";

type PendingWorkerRecord = {
  id: string;
  name: string;
  specialty: "plumber" | "electrician" | "acTechnician";
  area: string;
  experienceYears: number;
  rating: number;
  documentsReady: number;
  submittedAt: string;
  status: VerificationStatus;
};

const verifyWorkerSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"])
});

const pendingWorkers: PendingWorkerRecord[] = [
  {
    id: "worker-18",
    name: "Mahmoud Saber",
    specialty: "plumber",
    area: "Nasr City",
    experienceYears: 7,
    rating: 4.8,
    documentsReady: 5,
    submittedAt: "2026-03-27",
    status: "UNDER_REVIEW"
  },
  {
    id: "worker-19",
    name: "Ali Nader",
    specialty: "electrician",
    area: "New Cairo",
    experienceYears: 6,
    rating: 4.7,
    documentsReady: 4,
    submittedAt: "2026-03-27",
    status: "DOCUMENTS_SUBMITTED"
  },
  {
    id: "worker-20",
    name: "Khaled Amin",
    specialty: "acTechnician",
    area: "Maadi",
    experienceYears: 9,
    rating: 4.9,
    documentsReady: 3,
    submittedAt: "2026-03-28",
    status: "AWAITING_ID"
  }
];

const adminClients = {
  summary: {
    totalClients: 14200,
    activeThisWeek: 3240,
    vipClients: 186,
    averageRating: 4.8
  },
  clients: [
    { id: "client-1", name: "Mariam Hassan", city: "New Cairo", requests: 28, walletBalance: 860, status: "VIP" },
    { id: "client-2", name: "Karim Adel", city: "Maadi", requests: 11, walletBalance: 220, status: "Active" },
    { id: "client-3", name: "Nour Emad", city: "Nasr City", requests: 17, walletBalance: 0, status: "Active" }
  ]
};

const adminRequests = {
  summary: {
    active: 186,
    completedToday: 88,
    disputed: 12,
    averageTicket: 410
  },
  requests: [
    { id: "req-101", title: "Urgent electrical repair", status: "WORKER_EN_ROUTE", city: "New Cairo", amount: 320 },
    { id: "req-102", title: "Kitchen plumbing fix", status: "IN_PROGRESS", city: "Maadi", amount: 410 },
    { id: "req-103", title: "AC maintenance", status: "PENDING", city: "Nasr City", amount: 450 }
  ]
};

const adminFinance = {
  summary: {
    totalRevenue: 684000,
    commissions: 102600,
    escrowHeld: 274000,
    releasedThisWeek: 84200
  },
  streams: [
    { label: "Commissions", value: 102600 },
    { label: "Escrow held", value: 274000 },
    { label: "Released", value: 84200 }
  ],
  payouts: [
    { id: "pay-1", label: "Worker batch payout", status: "Scheduled", amount: 52000 },
    { id: "pay-2", label: "Escrow release", status: "Processed", amount: 18400 }
  ]
};

const adminSettings = {
  platform: {
    supportEmail: "support@osta.eg",
    emergencyHotline: "+20 100 000 0000",
    defaultLanguage: "ar"
  },
  operations: {
    autoAssignmentEnabled: false,
    manualVerificationRequired: true,
    payoutsSchedule: "Weekly"
  },
  moderation: {
    complaintEscalationHours: 24,
    reviewVisibilityCheck: true,
    workerRecheckCycleDays: 90
  }
};

function buildPendingSummary() {
  const visibleWorkers = pendingWorkers.filter((item) => item.status !== "VERIFIED" && item.status !== "REJECTED");

  return {
    totalPending: visibleWorkers.length,
    highPriority: visibleWorkers.filter((item) => item.status === "UNDER_REVIEW" || item.status === "AWAITING_ID").length,
    submittedToday: visibleWorkers.filter((item) => item.submittedAt === "2026-03-28").length,
    averageReviewHours: visibleWorkers.length === 0 ? 0 : 29
  };
}

function getVisiblePendingWorkers() {
  return pendingWorkers.filter((item) => item.status !== "VERIFIED" && item.status !== "REJECTED");
}

router.get("/dashboard", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: {
          totalRevenue: 684000,
          revenueGrowth: 12,
          pendingVerifications: 43,
          highPriorityVerifications: 13,
          openComplaints: 12,
          underInvestigation: 4,
          activeRequests: 186,
          requestsDelta: 21
        },
        verificationQueue: [
          ...getVisiblePendingWorkers().map((item) => ({
            id: item.id,
            name: item.name,
            specialty: item.specialty,
            status: item.status,
            submittedAt: item.submittedAt
          }))
        ],
        alerts: [
          "complaintsUnderInvestigation",
          "escrowApprovalsNeedReview",
          "workersReadyForActivation"
        ],
        financePulse: {
          commissions: 68,
          escrowHeld: 81,
          releasedThisWeek: 52,
          refundPressure: 14
        },
        operationalMix: {
          clientsCount: 14200,
          workersCount: 5100,
          walletFlow: 274000,
          qualityScore: 96
        }
      },
      "Admin dashboard fetched"
    )
  );
});

router.get("/analytics", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        period: "month",
        revenue: [540000, 590000, 684000],
        completedRequests: [3800, 4210, 4980],
        workerGrowth: [120, 150, 210]
      },
      "Admin analytics fetched"
    )
  );
});

router.get("/workers/pending", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        summary: buildPendingSummary(),
        workers: getVisiblePendingWorkers()
      },
      "Pending workers fetched"
    )
  );
});

router.patch("/workers/:id/verify", (request, response) => {
  const payload = verifyWorkerSchema.parse(request.body ?? {});
  const worker = pendingWorkers.find((item) => item.id === request.params.id);

  if (!worker) {
    response.status(404).json({ success: false, message: "Worker not found", error: "NOT_FOUND" });
    return;
  }

  worker.status = payload.status;

  response.status(200).json(
    successResponse(
      {
        summary: buildPendingSummary(),
        workers: getVisiblePendingWorkers()
      },
      payload.status === "VERIFIED" ? "Worker verified" : "Worker rejected"
    )
  );
});

router.get("/finance/revenue", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        total: 684000,
        commissions: 102600,
        escrowHeld: 274000,
        releasedThisWeek: 84200
      },
      "Finance revenue fetched"
    )
  );
});

router.get("/clients", (_request, response) => {
  response.status(200).json(successResponse(adminClients, "Admin clients fetched"));
});

router.get("/requests", (_request, response) => {
  response.status(200).json(successResponse(adminRequests, "Admin requests fetched"));
});

router.get("/finance", (_request, response) => {
  response.status(200).json(successResponse(adminFinance, "Admin finance fetched"));
});

router.get("/settings", (_request, response) => {
  response.status(200).json(successResponse(adminSettings, "Admin settings fetched"));
});

export const adminRouter = router;
