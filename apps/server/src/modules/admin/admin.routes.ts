import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiError } from "../../utils/ApiError.js";

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

const pendingWorkers: PendingWorkerRecord[] = [];

const adminClients = {
  summary: {
    totalClients: 0,
    activeThisWeek: 0,
    vipClients: 0,
    averageRating: 0
  },
  clients: []
};

const adminRequests = {
  summary: {
    active: 0,
    completedToday: 0,
    disputed: 0,
    averageTicket: 0
  },
  requests: []
};

const adminFinance = {
  summary: {
    totalRevenue: 0,
    commissions: 0,
    escrowHeld: 0,
    releasedThisWeek: 0
  },
  streams: [],
  payouts: []
};

const adminSettings = {
  platform: {
    supportEmail: "",
    emergencyHotline: "",
    defaultLanguage: "ar"
  },
  operations: {
    autoAssignmentEnabled: false,
    manualVerificationRequired: false,
    payoutsSchedule: ""
  },
  moderation: {
    complaintEscalationHours: 0,
    reviewVisibilityCheck: false,
    workerRecheckCycleDays: 0
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

router.get("/dashboard", catchAsync(async (_request, response) => {
  const [
    revenue,
    pendingVerifications,
    openComplaints,
    activeRequests,
    verificationQueue
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { platformCommission: true },
      where: { status: "COMPLETED" }
    }),
    prisma.workerProfile.count({
      where: { verificationStatus: { in: ["UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "AWAITING_ID"] } }
    }),
    prisma.complaint.count({
      where: { status: "OPEN" }
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } }
    }),
    prisma.workerProfile.findMany({
      where: { verificationStatus: { in: ["UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "AWAITING_ID"] } },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } }
      },
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  response.status(200).json(
    successResponse(
      {
        summary: {
          totalRevenue: revenue._sum.platformCommission || 0,
          revenueGrowth: 12, // Mock growth for now
          pendingVerifications,
          highPriorityVerifications: pendingVerifications,
          openComplaints,
          underInvestigation: openComplaints,
          activeRequests,
          requestsDelta: 5
        },
        verificationQueue: verificationQueue.map((w) => ({
          id: w.id,
          name: `${w.user.firstName} ${w.user.lastName}`,
          phone: w.user.phone,
          specialty: w.specialty,
          status: w.verificationStatus,
          submittedAt: w.createdAt.toISOString().split("T")[0]
        })),
        alerts: openComplaints > 0 ? ["complaintsUnderInvestigation"] : [],
        financePulse: {
          commissions: revenue._sum.platformCommission || 0,
          escrowHeld: 0,
          releasedThisWeek: 0,
          refundPressure: 0
        },
        operationalMix: {
          clientsCount: await prisma.user.count({ where: { role: "CLIENT" } }),
          workersCount: await prisma.workerProfile.count(),
          walletFlow: 0,
          qualityScore: 4.8
        }
      },
      "Admin dashboard fetched"
    )
  );
}));

router.get("/analytics", (_request, response) => {
  response.status(200).json(
    successResponse(
      {
        period: "month",
        revenue: [],
        completedRequests: [],
        workerGrowth: []
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
        total: 0,
        commissions: 0,
        escrowHeld: 0,
        releasedThisWeek: 0
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

// --- REAL DATA VENDOR MANAGEMENT ---

// GET /api/admin/vendors — List all vendors with subscription status
router.get("/vendors", catchAsync(async (_request, response) => {
  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  
  response.json(successResponse(vendors, "Vendors fetched successfully"));
}));

// POST /api/admin/vendors/:id/quota — Add +10 orders to vendor quota
router.post("/vendors/:id/quota", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  
  const updated = await prisma.vendorProfile.update({
    where: { id },
    data: { orderQuota: { increment: 10 } }
  });
  
  response.json(successResponse(updated, "Quota updated successfully"));
}));

// POST /api/admin/vendors/:id/reset-trial — Reset trial to 30 days from now
router.post("/vendors/:id/reset-trial", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const now = new Date();
  
  const updated = await prisma.vendorProfile.update({
    where: { id },
    data: { trialExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
  });
  
  response.json(successResponse(updated, "Trial reset successfully"));
}));

// --- REAL DATA WORKER MANAGEMENT ---

// GET /api/admin/workers — List all workers with subscription status
router.get("/workers", catchAsync(async (_request, response) => {
  const workers = await prisma.workerProfile.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  
  response.json(successResponse(workers, "Workers fetched successfully"));
}));

// POST /api/admin/workers/:id/quota — Add +10 orders to worker quota
router.post("/workers/:id/quota", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  
  const updated = await prisma.workerProfile.update({
    where: { id },
    data: { orderQuota: { increment: 10 } }
  });
  
  response.json(successResponse(updated, "Quota updated successfully"));
}));

// POST /api/admin/workers/:id/reset-trial — Reset trial to 30 days from now
router.post("/workers/:id/reset-trial", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const now = new Date();
  
  const updated = await prisma.workerProfile.update({
    where: { id },
    data: { trialExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
  });
  
  response.json(successResponse(updated, "Trial reset successfully"));
}));

// POST /api/admin/workers/:id/verify — Mark worker as VERIFIED and start 30-day trial
router.post("/workers/:id/verify", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const updated = await prisma.workerProfile.update({
    where: { id },
    data: { 
      verificationStatus: "VERIFIED",
      verifiedAt: now,
      trialExpiresAt
    }
  });
  
  response.json(successResponse(updated, "Worker verified and 30-day trial started successfully"));
}));

// POST /api/admin/vendors/:id/verify — Mark vendor as VERIFIED and start 30-day trial
router.post("/vendors/:id/verify", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const updated = await prisma.vendorProfile.update({
    where: { id },
    data: { 
      verificationStatus: "VERIFIED",
      verifiedAt: now,
      trialExpiresAt
    }
  });
  
  response.json(successResponse(updated, "Vendor verified and 30-day trial started successfully"));
}));

export const adminRouter = router;
