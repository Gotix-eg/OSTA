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
    prisma.serviceRequest.aggregate({
      _sum: { estimatedPrice: true }, // Using estimatedPrice as a proxy for revenue if needed, or totalAmount
      where: { status: "COMPLETED" }
    }),
    prisma.workerProfile.count({
      where: { verificationStatus: { in: ["PENDING", "UNDER_REVIEW", "DOCUMENTS_SUBMITTED"] } }
    }),
    prisma.complaint.count({
      where: { status: "OPEN" }
    }),
    prisma.serviceRequest.count({
      where: { status: { in: ["PENDING", "ACCEPTED", "WORKER_EN_ROUTE", "IN_PROGRESS"] } }
    }),
    prisma.workerProfile.findMany({
      where: { verificationStatus: { in: ["PENDING", "UNDER_REVIEW", "DOCUMENTS_SUBMITTED"] } },
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
          totalRevenue: revenue._sum.estimatedPrice || 0,
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
          specialty: "عام",
          status: w.verificationStatus,
          submittedAt: w.createdAt.toISOString().split("T")[0]
        })),
        alerts: openComplaints > 0 ? ["complaintsUnderInvestigation"] : [],
        financePulse: {
          commissions: (revenue._sum.estimatedPrice || 0) * 0.15,
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

router.get("/clients", catchAsync(async (_request, response) => {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      clientProfile: true,
      addresses: { take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalClients = clients.length;
  const activeThisWeek = clients.filter(c => c.clientProfile && c.clientProfile.totalRequests > 0).length || Math.floor(totalClients * 0.4);
  const vipClients = clients.filter(c => c.clientProfile && c.clientProfile.totalRequests > 10).length;
  
  let totalRating = 0;
  let ratingCount = 0;
  clients.forEach(c => {
    if (c.clientProfile?.rating) {
      totalRating += c.clientProfile.rating;
      ratingCount++;
    }
  });
  const averageRating = ratingCount > 0 ? totalRating / ratingCount : 5.0;

  const mappedClients = clients.map(c => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
    city: c.addresses?.[0]?.city || "غير محدد",
    requests: c.clientProfile?.totalRequests || 0,
    walletBalance: c.clientProfile?.walletBalance || 0,
    status: c.status
  }));

  const data = {
    summary: {
      totalClients,
      activeThisWeek,
      vipClients,
      averageRating: parseFloat(averageRating.toFixed(1))
    },
    clients: mappedClients
  };

  response.status(200).json(successResponse(data, "Admin clients fetched"));
}));

router.get("/requests", catchAsync(async (_request, response) => {
  const requests = await prisma.serviceRequest.findMany({
    include: {
      address: { select: { city: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const active = requests.filter(r => ["PENDING", "ACCEPTED", "WORKER_EN_ROUTE", "IN_PROGRESS"].includes(r.status)).length;
  const completedToday = requests.filter(r => r.status === "COMPLETED" && new Date(r.createdAt).toDateString() === new Date().toDateString()).length;
  const disputed = 0;

  let totalTicket = 0;
  let ticketCount = 0;
  requests.forEach(r => {
    if (r.estimatedPrice) {
      totalTicket += r.estimatedPrice;
      ticketCount++;
    }
  });
  const averageTicket = ticketCount > 0 ? totalTicket / ticketCount : 0;

  const mappedRequests = requests.map(r => ({
    id: r.id,
    title: r.title || `طلب #${r.requestNumber}`,
    status: r.status,
    city: r.address?.city || "غير محدد",
    amount: r.estimatedPrice || 0
  }));

  const data = {
    summary: {
      active,
      completedToday,
      disputed,
      averageTicket: Math.round(averageTicket)
    },
    requests: mappedRequests
  };

  response.status(200).json(successResponse(data, "Admin requests fetched"));
}));

router.get("/finance", catchAsync(async (_request, response) => {
  const requests = await prisma.serviceRequest.findMany({
    where: { status: "COMPLETED" }
  });

  let totalRevenue = 0;
  requests.forEach(r => {
    totalRevenue += (r.estimatedPrice || 0);
  });
  
  const commissions = totalRevenue * 0.15;

  const data = {
    summary: {
      totalRevenue,
      commissions,
      escrowHeld: 0,
      releasedThisWeek: 0
    },
    streams: [
      { label: "صيانة منزلية", value: totalRevenue * 0.6 },
      { label: "مشتريات", value: totalRevenue * 0.4 }
    ],
    payouts: []
  };

  response.status(200).json(successResponse(data, "Admin finance fetched"));
}));

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

// --- USER DELETION ---
router.delete("/users/:id", catchAsync(async (req, res) => {
  const id = req.params.id as string;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      clientProfile: true,
      workerProfile: true,
      vendorProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const clientProfileId = user.clientProfile?.id;
  const workerProfileId = user.workerProfile?.id;
  const vendorProfileId = user.vendorProfile?.id;

  const deleteOperations: any[] = [];

  // 1. AuditLog: nullify userId
  deleteOperations.push(
    prisma.auditLog.updateMany({
      where: { userId: id },
      data: { userId: null }
    })
  );

  // 2. Messages
  deleteOperations.push(
    prisma.message.deleteMany({
      where: { OR: [{ senderId: id }, { receiverId: id }] }
    })
  );

  // 3. WalletTransactions
  deleteOperations.push(
    prisma.walletTransaction.deleteMany({
      where: { userId: id }
    })
  );

  // 4. Reviews
  deleteOperations.push(
    prisma.review.deleteMany({
      where: { OR: [{ authorId: id }, { targetId: id }] }
    })
  );

  // 5. Complaints
  deleteOperations.push(
    prisma.complaint.deleteMany({
      where: { OR: [{ authorId: id }, { targetId: id }] }
    })
  );

  // 6. AdCampaigns
  deleteOperations.push(
    prisma.adCampaign.deleteMany({
      where: { ownerId: id }
    })
  );

  // 7. MaterialRequests & Orders for Client/Requester
  deleteOperations.push(
    prisma.materialOrder.deleteMany({
      where: {
        OR: [
          { clientId: id },
          { clientId: clientProfileId || "" },
          { request: { requesterId: id } }
        ]
      }
    })
  );

  deleteOperations.push(
    prisma.materialRequest.deleteMany({
      where: { requesterId: id }
    })
  );

  // 8. DirectOrders where Client
  deleteOperations.push(
    prisma.directOrder.deleteMany({
      where: {
        OR: [
          { clientId: id },
          { clientId: clientProfileId || "" }
        ]
      }
    })
  );

  // 9. ClientProfile specific: ServiceRequests
  if (clientProfileId) {
    // Delete non-cascade children of ServiceRequest
    deleteOperations.push(
      prisma.payment.deleteMany({
        where: { request: { clientId: clientProfileId } }
      })
    );
    deleteOperations.push(
      prisma.review.deleteMany({
        where: { request: { clientId: clientProfileId } }
      })
    );
    deleteOperations.push(
      prisma.warranty.deleteMany({
        where: { request: { clientId: clientProfileId } }
      })
    );
    deleteOperations.push(
      prisma.complaint.deleteMany({
        where: { request: { clientId: clientProfileId } }
      })
    );
    deleteOperations.push(
      prisma.invoice.deleteMany({
        where: { request: { clientId: clientProfileId } }
      })
    );
    deleteOperations.push(
      prisma.serviceRequest.deleteMany({
        where: { clientId: clientProfileId }
      })
    );
  }

  // 10. WorkerProfile specific
  if (workerProfileId) {
    deleteOperations.push(
      prisma.serviceRequest.updateMany({
        where: { workerId: workerProfileId },
        data: { workerId: null }
      })
    );
    deleteOperations.push(
      prisma.requestOffer.deleteMany({
        where: { workerId: workerProfileId }
      })
    );
  }

  // 11. VendorProfile specific
  if (vendorProfileId) {
    deleteOperations.push(
      prisma.directOrder.deleteMany({
        where: { vendorId: vendorProfileId }
      })
    );
    deleteOperations.push(
      prisma.materialOrder.deleteMany({
        where: { vendorId: vendorProfileId }
      })
    );
    deleteOperations.push(
      prisma.materialOffer.deleteMany({
        where: { vendorId: vendorProfileId }
      })
    );
  }

  // 12. Delete User itself (cascades clientProfile, workerProfile, vendorProfile, addresses, sessions, notifications, otpCodes)
  deleteOperations.push(
    prisma.user.delete({
      where: { id }
    })
  );

  await prisma.$transaction(deleteOperations);

  res.json(successResponse({}, "User deleted successfully"));
}));

// --- WALLET MANAGEMENT ---

// PATCH /admin/workers/:id/wallet
router.patch("/workers/:id/wallet", catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { amount, balance } = req.body;

  let updateData: any = {};
  if (balance !== undefined) {
    updateData = { walletBalance: parseFloat(balance) };
  } else if (amount !== undefined) {
    updateData = { walletBalance: { increment: parseFloat(amount) } };
  } else {
    throw new ApiError(400, "Must provide amount or balance");
  }

  // Fetch worker to get userId for creating wallet transaction log
  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    select: { userId: true, walletBalance: true }
  });

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  const updated = await prisma.workerProfile.update({
    where: { id },
    data: updateData
  });

  // Create WalletTransaction log
  const newBalance = updated.walletBalance;
  const diff = newBalance - worker.walletBalance;
  await prisma.walletTransaction.create({
    data: {
      userId: worker.userId,
      type: diff >= 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
      amount: Math.abs(diff),
      balance: newBalance,
      description: `تعديل الرصيد بواسطة الإدارة: ${diff >= 0 ? '+' : ''}${diff}`
    }
  });

  res.json(successResponse(updated, "Worker wallet updated successfully"));
}));

// PATCH /admin/vendors/:id/wallet
router.patch("/vendors/:id/wallet", catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { amount, balance } = req.body;

  let updateData: any = {};
  if (balance !== undefined) {
    updateData = { walletBalance: parseFloat(balance) };
  } else if (amount !== undefined) {
    updateData = { walletBalance: { increment: parseFloat(amount) } };
  } else {
    throw new ApiError(400, "Must provide amount or balance");
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    select: { userId: true, walletBalance: true }
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const updated = await prisma.vendorProfile.update({
    where: { id },
    data: updateData
  });

  const newBalance = updated.walletBalance;
  const diff = newBalance - vendor.walletBalance;
  await prisma.walletTransaction.create({
    data: {
      userId: vendor.userId,
      type: diff >= 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
      amount: Math.abs(diff),
      balance: newBalance,
      description: `تعديل الرصيد بواسطة الإدارة: ${diff >= 0 ? '+' : ''}${diff}`
    }
  });

  res.json(successResponse(updated, "Vendor wallet updated successfully"));
}));

// PATCH /admin/clients/:id/wallet
router.patch("/clients/:id/wallet", catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { amount, balance } = req.body;

  let updateData: any = {};
  if (balance !== undefined) {
    updateData = { walletBalance: parseFloat(balance) };
  } else if (amount !== undefined) {
    updateData = { walletBalance: { increment: parseFloat(amount) } };
  } else {
    throw new ApiError(400, "Must provide amount or balance");
  }

  let clientProfile = await prisma.clientProfile.findFirst({
    where: { OR: [{ id }, { userId: id }] }
  });

  if (!clientProfile) {
    throw new ApiError(404, "Client profile not found");
  }

  const updated = await prisma.clientProfile.update({
    where: { id: clientProfile.id },
    data: updateData
  });

  const newBalance = updated.walletBalance;
  const diff = newBalance - clientProfile.walletBalance;
  await prisma.walletTransaction.create({
    data: {
      userId: clientProfile.userId,
      type: diff >= 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
      amount: Math.abs(diff),
      balance: newBalance,
      description: `تعديل الرصيد بواسطة الإدارة: ${diff >= 0 ? '+' : ''}${diff}`
    }
  });

  res.json(successResponse(updated, "Client wallet updated successfully"));
}));

export const adminRouter = router;
