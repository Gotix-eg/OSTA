import { Router } from "express";
import { UserRole } from "@prisma/client";
import crypto from "node:crypto";

import { z } from "zod";
import { getCategorySlugFromProfession } from "../../routes/index.js";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { normalizeHeroSlidesForStorage, normalizeCampaignsForStorage } from "./hero-slides.storage.js";
import { getAvatarLibrary, saveAvatarLibrary, getRandomWorkerAvatar } from "../../lib/avatar-library.js";
import { signAccessToken, signRefreshToken } from "../../utils/tokens.js";
import { setAuthCookies } from "../../utils/auth-cookies.js";
import { hashPassword } from "../../utils/password.js";

const router = Router();

router.use(authenticate, requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

type VerificationStatus = "UNDER_REVIEW" | "DOCUMENTS_SUBMITTED" | "AWAITING_ID" | "VERIFIED" | "REJECTED";

type PendingWorkerRecord = {
  id: string;
  name: string;
  specialty:
    | "plumber"
    | "electrician"
    | "acTechnician"
    | "carpenter"
    | "painter"
    | "aluminum"
    | "computerRepair"
    | "networks"
    | "cctv"
    | "applianceRepair"
    | "cleaning"
    | "gypsum"
    | "ceramic"
    | "plastering"
    | "ironwork"
    | "finishing"
    | "moving"
    | "carMechanic"
    | "bikeMechanic"
    | "engineRepair";
  area: string;
  experienceYears: number;
  rating: number;
  documentsReady: number;
  submittedAt: string;
  status: VerificationStatus;
  nationalIdFront?: string | null;
  nationalIdBack?: string | null;
  selfieWithId?: string | null;
  criminalRecord?: string | null;
  utilityBillUrl?: string | null;
  nationalIdNumber?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
};

const verifyWorkerSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"])
});

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

function mapPendingWorkerSpecialty(profession?: string | null): PendingWorkerRecord["specialty"] {
  const value = (profession || "").toLowerCase().trim();
  if (value.includes("سبا") || value.includes("plumb")) return "plumber";
  if (value.includes("تكييف") || value.includes("ac")) return "acTechnician";
  if (value.includes("نجار") || value.includes("carpenter")) return "carpenter";
  if (value.includes("نقاش") || value.includes("دهان") || value.includes("paint")) return "painter";
  if (value.includes("الوم") || value.includes("aluminum")) return "aluminum";
  if (value.includes("كمبيوتر") || value.includes("computer")) return "computerRepair";
  if (value.includes("شبك") || value.includes("network")) return "networks";
  if (value.includes("كامير") || value.includes("cctv")) return "cctv";
  if (value.includes("أجهز") || value.includes("appliance")) return "applianceRepair";
  if (value.includes("نظاف") || value.includes("clean")) return "cleaning";
  if (value.includes("جبس") || value.includes("gypsum")) return "gypsum";
  if (value.includes("سيراميك") || value.includes("ceramic")) return "ceramic";
  if (value.includes("محارة") || value.includes("plaster")) return "plastering";
  if (value.includes("حداد") || value.includes("iron")) return "ironwork";
  if (value.includes("تشطيب") || value.includes("finish")) return "finishing";
  if (value.includes("نقل") || value.includes("move")) return "moving";
  if (value.includes("سيار") || value.includes("car")) return "carMechanic";
  if (value.includes("موتوسيك") || value.includes("motorcycl") || value.includes("bike")) return "bikeMechanic";
  if (value.includes("موتور") || value.includes("engine")) return "engineRepair";
  return "electrician";
}

function mapPendingWorkerStatus(status: string): VerificationStatus {
  if (status === "UNDER_REVIEW" || status === "DOCUMENTS_SUBMITTED") return status;
  if (status === "REJECTED" || status === "VERIFIED") return status;
  return "DOCUMENTS_SUBMITTED";
}

async function getPendingWorkersData() {
  const pendingStatuses = ["PENDING", "DOCUMENTS_SUBMITTED", "UNDER_REVIEW"] as const;
  const workers = await prisma.workerProfile.findMany({
    where: {
      verificationStatus: { in: [...pendingStatuses] }
    },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true, email: true, lastLoginAt: true } },
      workAreas: { take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  const today = new Date().toISOString().split("T")[0] ?? "";
  const visibleWorkers = workers.map((worker) => {
    const documentsReady = [
      worker.nationalIdFront,
      worker.nationalIdBack,
      worker.selfieWithId,
      worker.criminalRecord
    ].filter(Boolean).length;

    return {
      id: worker.id,
      name: `${worker.user.firstName} ${worker.user.lastName}`.trim(),
      phone: worker.user.phone,
      avatarUrl: worker.user.avatarUrl,
      email: worker.user.email,
      profession: worker.profession,
      bio: worker.bio,
      specialty: mapPendingWorkerSpecialty(worker.profession),
      area: worker.workAreas[0]?.area || worker.workAreas[0]?.city || "غير محدد",
      experienceYears: worker.yearsOfExperience,
      rating: worker.rating,
      documentsReady,
      submittedAt: worker.createdAt.toISOString().split("T")[0] ?? "",
      status: mapPendingWorkerStatus(worker.verificationStatus),
      nationalIdFront: worker.nationalIdFront,
      nationalIdBack: worker.nationalIdBack,
      selfieWithId: worker.selfieWithId,
      criminalRecord: worker.criminalRecord,
      utilityBillUrl: worker.utilityBillUrl,
      nationalIdNumber: worker.nationalIdNumber,
      guarantorName: worker.guarantorName,
      guarantorPhone: worker.guarantorPhone,
      stepVerifications: worker.stepVerifications as any,
      verifiedAt: worker.verifiedAt?.toISOString() || null,
      verifiedBy: worker.verifiedBy || null,
      lastLoginAt: worker.user.lastLoginAt?.toISOString() || null,
      createdAt: worker.createdAt.toISOString()
    };
  });

  return {
    summary: {
      totalPending: visibleWorkers.length,
      highPriority: visibleWorkers.filter((item) => item.status === "UNDER_REVIEW" || item.documentsReady < 2).length,
      submittedToday: visibleWorkers.filter((item) => item.submittedAt === today).length,
      averageReviewHours: 0
    },
    workers: visibleWorkers
  };
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

router.get("/workers/pending", catchAsync(async (_request, response) => {
  response.status(200).json(
    successResponse(
      await getPendingWorkersData(),
      "Pending workers fetched"
    )
  );
}));

const stepNamesMap: Record<string, string> = {
  phone: "التحقق من رقم الهاتف والمكالمة",
  avatar: "التحقق من صورة الملف الشخصي والسيلفي",
  national_id: "التحقق من بطاقة الرقم القومي واسم العامل",
  documents: "التحقق من الصحيفة الجنائية وإيصال المرافق والضامن",
  profession: "التحقق من المهنة والخبرة والشهادات",
  public_profile: "مراجعة الصفحة العامة للفني",
  final_approval: "التوقيع والاعتماد النهائي لحساب العامل"
};

const verifyStepSchema = z.object({
  stepKey: z.enum(["phone", "avatar", "national_id", "documents", "profession", "public_profile", "final_approval"]),
  status: z.enum(["VERIFIED", "REJECTED", "FLAGGED"]),
  notes: z.string().optional()
});

router.post("/workers/:id/verify-step", catchAsync(async (request, response) => {
  const workerId = request.params.id as string;
  const { stepKey, status, notes } = verifyStepSchema.parse(request.body ?? {});

  const adminUserId = (request as any).user?.id;
  const adminUser = adminUserId ? await prisma.user.findUnique({ where: { id: adminUserId } }) : null;
  const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "أدمن النظام";

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: { user: true }
  });

  if (!worker) {
    throw new ApiError(404, "Worker profile not found");
  }

  const existingSteps = (worker.stepVerifications as Record<string, any>) || {};
  const now = new Date();

  const stepRecord = {
    stepKey,
    stepName: stepNamesMap[stepKey] || stepKey,
    status,
    verifiedAt: now.toISOString(),
    verifiedByAdminId: adminUserId || "admin",
    verifiedByAdminName: adminName,
    notes: notes || ""
  };

  const updatedSteps = {
    ...existingSteps,
    [stepKey]: stepRecord
  };

  if (stepKey === "phone" && status === "VERIFIED") {
    await prisma.user.update({
      where: { id: worker.userId },
      data: { phoneVerified: true }
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: adminUserId || null,
      action: `WORKER_STEP_${stepKey.toUpperCase()}_${status}`,
      entity: "WorkerProfile",
      entityId: workerId,
      newData: {
        workerId,
        workerName: `${worker.user.firstName} ${worker.user.lastName}`,
        stepKey,
        stepName: stepNamesMap[stepKey] || stepKey,
        status,
        notes: notes || "",
        adminId: adminUserId || null,
        adminName,
        adminEmail: adminUser?.email || null,
        timestamp: now.toISOString()
      }
    }
  });

  const mainSteps = ["phone", "avatar", "national_id", "documents", "public_profile"];
  const allMainVerified = mainSteps.every(s => updatedSteps[s]?.status === "VERIFIED");
  const isFinalApproval = stepKey === "final_approval" && status === "VERIFIED";

  let nextVerificationStatus = worker.verificationStatus;
  let trialExpiresAt = worker.trialExpiresAt;

  if (allMainVerified || isFinalApproval) {
    nextVerificationStatus = "VERIFIED";
    trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.auditLog.create({
      data: {
        userId: adminUserId || null,
        action: "WORKER_FULL_VERIFICATION_APPROVED",
        entity: "WorkerProfile",
        entityId: workerId,
        newData: {
          workerId,
          workerName: `${worker.user.firstName} ${worker.user.lastName}`,
          status: "VERIFIED",
          adminName,
          adminEmail: adminUser?.email || null,
          notes: notes || "تم اعتماد وتوثيق كافة بيانات العامل وتوقيع حسابه بنجاح",
          timestamp: now.toISOString()
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: worker.userId,
        type: "VERIFICATION_UPDATE",
        title: "تم توثيق واعتماد حسابك بنجاح! 🎉",
        body: `تم مراجعة وتوقيع كافة بياناتك بواسطة الأدمن (${adminName}). حسابك الآن جاهز لاستقبال الطلبات.`
      }
    }).catch(() => {});
  } else if (status === "REJECTED" && stepKey === "final_approval") {
    nextVerificationStatus = "REJECTED";
  }

  const updatedWorker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      stepVerifications: updatedSteps,
      verificationStatus: nextVerificationStatus,
      verifiedAt: nextVerificationStatus === "VERIFIED" ? now : worker.verifiedAt,
      verifiedBy: nextVerificationStatus === "VERIFIED" ? adminName : worker.verifiedBy,
      trialExpiresAt
    },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true, email: true } },
      workAreas: { take: 1 },
      certificates: true
    }
  });

  response.status(200).json(
    successResponse(
      {
        worker: updatedWorker,
        stepVerifications: updatedSteps,
        stepRecord
      },
      `Step ${stepKey} updated to ${status}`
    )
  );
}));

router.get("/workers/:id/audit-logs", catchAsync(async (request, response) => {
  const workerId = request.params.id as string;
  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "WorkerProfile",
      entityId: workerId
    },
    orderBy: { createdAt: "desc" }
  });

  response.status(200).json(
    successResponse(logs, "Worker audit logs fetched successfully")
  );
}));

router.patch("/workers/:id/verify", catchAsync(async (request, response) => {
  const payload = verifyWorkerSchema.parse(request.body ?? {});
  const workerId = request.params.id as string;
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const adminUserId = (request as any).user?.id;
  const adminUser = adminUserId ? await prisma.user.findUnique({ where: { id: adminUserId } }) : null;
  const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "أدمن النظام";

  const updatedWorker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: payload.status === "VERIFIED"
      ? {
          verificationStatus: "VERIFIED",
          verifiedAt: now,
          verifiedBy: adminName,
          trialExpiresAt
        }
      : {
          verificationStatus: "REJECTED",
          verifiedAt: now,
          verifiedBy: adminName
        },
    include: {
      user: { include: { addresses: { take: 1 } } }
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId || null,
      action: payload.status === "VERIFIED" ? "WORKER_FULL_VERIFICATION_APPROVED" : "WORKER_VERIFICATION_REJECTED",
      entity: "WorkerProfile",
      entityId: workerId,
      newData: {
        workerId,
        status: payload.status,
        adminName,
        adminEmail: adminUser?.email || null,
        timestamp: now.toISOString()
      }
    }
  });

  if (payload.status === "VERIFIED") {
    try {
      // 1. Create specialization if missing
      const hasSpec = await prisma.workerSpecialization.count({ where: { workerId: updatedWorker.id } });
      if (hasSpec === 0) {
        const catSlug = getCategorySlugFromProfession(updatedWorker.profession);

        const service = await prisma.service.findFirst({
          where: { category: { slug: catSlug } }
        });

        if (service) {
          await prisma.workerSpecialization.create({
            data: { workerId: updatedWorker.id, serviceId: service.id }
          }).catch(() => {});
        }
      }

      // 2. Create workArea if missing
      const hasArea = await prisma.workerArea.count({ where: { workerId: updatedWorker.id } });
      if (hasArea === 0) {
        const address = updatedWorker.user.addresses[0];
        await prisma.workerArea.create({
          data: {
            workerId: updatedWorker.id,
            governorate: address?.governorate || "cairo",
            city: address?.city || "new-cairo",
            area: address?.area || "5th-settlement"
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Failed to seed worker spec/area on verify:", e);
    }
  }

  response.status(200).json(
    successResponse(
      await getPendingWorkersData(),
      payload.status === "VERIFIED" ? "Worker verified" : "Worker rejected"
    )
  );
}));

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

// POST /api/admin/vendors — Manually create a vendor profile by support / admin
router.post("/vendors", catchAsync(async (request, response) => {
  const schema = z.object({
    shopName: z.string().min(2, "اسم المتجر مطلوب"),
    category: z.string().min(2, "تصنيف المتجر مطلوب"),
    firstName: z.string().min(2, "الاسم الأول للمسؤول مطلوب"),
    lastName: z.string().min(2, "اسم العائلة للمسؤول مطلوب"),
    phone: z.string().min(10, "رقم الهاتف غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    governorate: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    orderQuota: z.number().optional().default(20),
    verificationStatus: z.enum(["PENDING", "VERIFIED"]).optional().default("VERIFIED")
  });

  const payload = schema.parse(request.body);

  let cleanPhone = payload.phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("20")) {
    cleanPhone = "+" + cleanPhone;
  } else if (cleanPhone.startsWith("0")) {
    cleanPhone = "+20" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+20" + cleanPhone;
  }

  const existingUser = await prisma.user.findFirst({
    where: { phone: cleanPhone },
    include: { vendorProfile: true }
  });

  if (existingUser?.vendorProfile) {
    throw new ApiError(409, "رقم الهاتف هذا مسجل بالفعل كمتجر على المنصة.", "PROFILE_EXISTS");
  }

  const passwordHash = await hashPassword(payload.password);
  const now = new Date();
  const trialExpiresAt = payload.verificationStatus === "VERIFIED"
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  let vendorProfile;

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: "VENDOR",
        firstName: payload.firstName || existingUser.firstName,
        lastName: payload.lastName || existingUser.lastName
      }
    });

    vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: existingUser.id,
        shopName: payload.shopName,
        category: payload.category,
        governorate: payload.governorate || "cairo",
        city: payload.city || "new-cairo",
        address: payload.address || "",
        orderQuota: payload.orderQuota || 20,
        verificationStatus: payload.verificationStatus,
        trialExpiresAt,
        isOpen: true,
        rating: 5,
        ratingCount: 1,
        totalOrders: 0,
        totalEarnings: 0,
        walletBalance: 0
      },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } }
      }
    });
  } else {
    const user = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: cleanPhone,
        passwordHash,
        role: "VENDOR",
        status: "ACTIVE"
      }
    });

    if (payload.governorate || payload.city) {
      await prisma.address.create({
        data: {
          userId: user.id,
          governorate: payload.governorate || "cairo",
          city: payload.city || "new-cairo",
          area: payload.city || payload.governorate || "new-cairo",
          street: payload.address || "",
          isDefault: true
        }
      }).catch(() => {});
    }

    vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        shopName: payload.shopName,
        category: payload.category,
        governorate: payload.governorate || "cairo",
        city: payload.city || "new-cairo",
        address: payload.address || "",
        orderQuota: payload.orderQuota || 20,
        verificationStatus: payload.verificationStatus,
        trialExpiresAt,
        isOpen: true,
        rating: 5,
        ratingCount: 1,
        totalOrders: 0,
        totalEarnings: 0,
        walletBalance: 0
      },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } }
      }
    });
  }

  response.status(201).json(successResponse(vendorProfile, "Vendor profile created successfully"));
}));

// POST /api/admin/vendors/:id/reset-password — Reset vendor password manually by support
router.post("/vendors/:id/reset-password", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const { newPassword } = z.object({
    newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
  }).parse(request.body);

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: vendor.userId },
    data: { passwordHash }
  });

  response.json(successResponse({
    vendorId: vendor.id,
    phone: vendor.user.phone,
    shopName: vendor.shopName
  }, "تم تعيين وتحديث كلمة المرور بنجاح"));
}));

// --- REAL DATA WORKER MANAGEMENT ---

// GET /api/admin/workers — List all workers with subscription status
router.get("/workers", catchAsync(async (_request, response) => {
  const workers = await prisma.workerProfile.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phone: true, email: true, avatarUrl: true, lastLoginAt: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  
  response.json(successResponse(workers, "Workers fetched successfully"));
}));

// POST /api/admin/workers — Manually create a worker profile by support / admin
router.post("/workers", catchAsync(async (request, response) => {
  const schema = z.object({
    firstName: z.string().min(2, "الاسم الأول مطلوب"),
    lastName: z.string().min(2, "اسم العائلة مطلوب"),
    phone: z.string().min(10, "رقم الهاتف غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    profession: z.string().min(2, "المهنة / التخصص مطلوبة"),
    governorate: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    nationalIdNumber: z.string().optional(),
    yearsOfExperience: z.number().optional().default(0),
    orderQuota: z.number().optional().default(20),
    verificationStatus: z.enum(["PENDING", "UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "VERIFIED"]).optional().default("VERIFIED"),
    bio: z.string().optional()
  });

  const payload = schema.parse(request.body);

  // Clean phone number to Egyptian standard +20...
  let cleanPhone = payload.phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("20")) {
    cleanPhone = "+" + cleanPhone;
  } else if (cleanPhone.startsWith("0")) {
    cleanPhone = "+20" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+20" + cleanPhone;
  }

  const existingUser = await prisma.user.findFirst({
    where: { phone: cleanPhone },
    include: { workerProfile: true }
  });

  if (existingUser?.workerProfile) {
    throw new ApiError(409, "رقم الهاتف هذا مسجل بالفعل كفني على المنصة.", "PROFILE_EXISTS");
  }

  const passwordHash = await hashPassword(payload.password);
  const avatarFallback = await getRandomWorkerAvatar(payload.profession);
  const now = new Date();
  const trialExpiresAt = payload.verificationStatus === "VERIFIED"
    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  let workerProfile;

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: "WORKER",
        firstName: payload.firstName || existingUser.firstName,
        lastName: payload.lastName || existingUser.lastName,
        avatarUrl: existingUser.avatarUrl || avatarFallback || undefined
      }
    });

    workerProfile = await prisma.workerProfile.create({
      data: {
        userId: existingUser.id,
        profession: payload.profession,
        yearsOfExperience: payload.yearsOfExperience || 0,
        orderQuota: payload.orderQuota || 20,
        verificationStatus: payload.verificationStatus,
        verifiedAt: payload.verificationStatus === "VERIFIED" ? now : null,
        verifiedBy: "خدمة العملاء والإدارة",
        trialExpiresAt,
        nationalIdNumber: payload.nationalIdNumber || undefined,
        bio: payload.bio || undefined,
        rating: 5,
        ratingCount: 1,
        totalJobsCompleted: 0,
        walletBalance: 0,
        isAvailable: true,
        subscriptionTier: "free"
      },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, avatarUrl: true, lastLoginAt: true } }
      }
    });
  } else {
    const user = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: cleanPhone,
        passwordHash,
        role: "WORKER",
        status: "ACTIVE",
        avatarUrl: avatarFallback || undefined
      }
    });

    if (payload.governorate || payload.city) {
      await prisma.address.create({
        data: {
          userId: user.id,
          governorate: payload.governorate || "cairo",
          city: payload.city || "new-cairo",
          area: payload.city || payload.governorate || "new-cairo",
          street: payload.address || "",
          isDefault: true
        }
      }).catch(() => {});
    }

    workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        profession: payload.profession,
        yearsOfExperience: payload.yearsOfExperience || 0,
        orderQuota: payload.orderQuota || 20,
        verificationStatus: payload.verificationStatus,
        verifiedAt: payload.verificationStatus === "VERIFIED" ? now : null,
        verifiedBy: "خدمة العملاء والإدارة",
        trialExpiresAt,
        nationalIdNumber: payload.nationalIdNumber || undefined,
        bio: payload.bio || undefined,
        rating: 5,
        ratingCount: 1,
        totalJobsCompleted: 0,
        walletBalance: 0,
        isAvailable: true,
        subscriptionTier: "free"
      },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, avatarUrl: true, lastLoginAt: true } }
      }
    });
  }

  // Seed specialization & area if verified
  if (payload.verificationStatus === "VERIFIED") {
    try {
      const catSlug = getCategorySlugFromProfession(payload.profession);
      const service = await prisma.service.findFirst({
        where: { category: { slug: catSlug } }
      });
      if (service) {
        await prisma.workerSpecialization.create({
          data: { workerId: workerProfile.id, serviceId: service.id }
        }).catch(() => {});
      }
      await prisma.workerArea.create({
        data: {
          workerId: workerProfile.id,
          governorate: payload.governorate || "cairo",
          city: payload.city || "new-cairo",
          area: payload.city || "new-cairo"
        }
      }).catch(() => {});
    } catch (e) {
      console.error("Error setting worker initial specialization/area:", e);
    }
  }

  response.status(201).json(successResponse(workerProfile, "Worker profile created successfully"));
}));

// POST /api/admin/workers/:id/reset-password — Reset worker password manually by support
router.post("/workers/:id/reset-password", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const { newPassword } = z.object({
    newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
  }).parse(request.body);

  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!worker) {
    throw new ApiError(404, "Worker profile not found");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: worker.userId },
    data: { passwordHash }
  });

  response.json(successResponse({
    workerId: worker.id,
    phone: worker.user.phone,
    name: `${worker.user.firstName} ${worker.user.lastName}`
  }, "تم تعيين وتحديث كلمة المرور بنجاح"));
}));

// POST /api/admin/workers/:id/impersonate — Impersonate worker and switch session to /worker/profile
router.post("/workers/:id/impersonate", catchAsync(async (request, response) => {
  const workerId = request.params.id as string;
  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: { user: true }
  });
  if (!worker) {
    throw new ApiError(404, "Worker profile not found");
  }

  const adminToken = request.cookies?.osta_access_token || (request.headers.authorization ? request.headers.authorization.replace("Bearer ", "") : null);

  const session = await prisma.session.create({
    data: {
      userId: worker.userId,
      refreshToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  const refreshToken = signRefreshToken({
    sub: worker.userId,
    sessionId: session.id,
    type: "refresh"
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken }
  });

  const accessToken = signAccessToken({
    sub: worker.userId,
    role: "WORKER",
    sessionId: session.id
  });

  if (adminToken) {
    response.cookie("osta_admin_backup_token", adminToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  response.cookie("osta_impersonating_name", `${worker.user.firstName} ${worker.user.lastName}`, {
    httpOnly: false,
    sameSite: "strict",
    secure: false,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  setAuthCookies(response, {
    accessToken,
    refreshToken,
    role: "WORKER"
  });

  response.json(successResponse({
    redirectUrl: `/worker/profile`,
    workerName: `${worker.user.firstName} ${worker.user.lastName}`
  }, "Switched to worker profile session successfully"));
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
  
  const adminUserId = (request as any).user?.id;
  const adminUser = adminUserId ? await prisma.user.findUnique({ where: { id: adminUserId } }) : null;
  const adminName = adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "أدمن النظام";

  const updated = await prisma.workerProfile.update({
    where: { id },
    data: { 
      verificationStatus: "VERIFIED",
      verifiedAt: now,
      verifiedBy: adminName,
      trialExpiresAt
    },
    include: {
      user: { include: { addresses: { take: 1 } } }
    }
  });

  try {
    // 1. Create specialization if missing
    const hasSpec = await prisma.workerSpecialization.count({ where: { workerId: updated.id } });
    if (hasSpec === 0) {
      const catSlug = getCategorySlugFromProfession(updated.profession);

      const service = await prisma.service.findFirst({
        where: { category: { slug: catSlug } }
      });

      if (service) {
        await prisma.workerSpecialization.create({
          data: { workerId: updated.id, serviceId: service.id }
        }).catch(() => {});
      }
    }

    // 2. Create workArea if missing
    const hasArea = await prisma.workerArea.count({ where: { workerId: updated.id } });
    if (hasArea === 0) {
      const address = updated.user.addresses[0];
      await prisma.workerArea.create({
        data: {
          workerId: updated.id,
          governorate: address?.governorate || "cairo",
          city: address?.city || "new-cairo",
          area: address?.area || "5th-settlement"
        }
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to seed worker spec/area on POST verify:", e);
  }
  
  response.json(successResponse(updated, "Worker verified and 30-day trial started successfully"));
}));

// PATCH /api/admin/workers/:id — Edit worker profile details and settings
router.patch("/workers/:id", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const { 
    firstName, lastName, phone, avatarUrl,
    profession, bio, yearsOfExperience, orderQuota, verificationStatus, rating,
    totalJobsCompleted, walletBalance, isOnline, isAvailable, galleryVideoUrl,
    education, achievements, galleryImages,
    nationalIdNumber,
    nationalIdFront, nationalIdBack, selfieWithId, criminalRecord, utilityBillUrl
  } = request.body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    profession?: string;
    bio?: string;
    yearsOfExperience?: number;
    orderQuota?: number;
    verificationStatus?: any;
    rating?: number;
    totalJobsCompleted?: number;
    walletBalance?: number;
    isOnline?: boolean;
    isAvailable?: boolean;
    galleryVideoUrl?: string;
    education?: string[];
    achievements?: string[];
    galleryImages?: string[];
    nationalIdNumber?: string | null;
    nationalIdFront?: string | null;
    nationalIdBack?: string | null;
    selfieWithId?: string | null;
    criminalRecord?: string | null;
    utilityBillUrl?: string | null;
  };

  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!worker) {
    throw new ApiError(404, "Worker profile not found");
  }

  if (firstName !== undefined || lastName !== undefined || phone !== undefined || avatarUrl !== undefined) {
    await prisma.user.update({
      where: { id: worker.userId },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        phone: phone !== undefined ? phone : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      }
    });
  }

  const updatedWorker = await prisma.workerProfile.update({
    where: { id },
    data: {
      profession: profession !== undefined ? profession : undefined,
      bio: bio !== undefined ? bio : undefined,
      yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) : undefined,
      orderQuota: orderQuota !== undefined ? Number(orderQuota) : undefined,
      verificationStatus: verificationStatus !== undefined ? verificationStatus : undefined,
      rating: rating !== undefined ? Number(rating) : undefined,
      totalJobsCompleted: totalJobsCompleted !== undefined ? Number(totalJobsCompleted) : undefined,
      walletBalance: walletBalance !== undefined ? Number(walletBalance) : undefined,
      isOnline: isOnline !== undefined ? Boolean(isOnline) : undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      galleryVideoUrl: galleryVideoUrl !== undefined ? galleryVideoUrl : undefined,
      education: education !== undefined ? education : undefined,
      achievements: achievements !== undefined ? achievements : undefined,
      galleryImages: galleryImages !== undefined ? galleryImages : undefined,
      nationalIdNumber: nationalIdNumber !== undefined ? (nationalIdNumber ? nationalIdNumber.trim() : null) : undefined,
      nationalIdFront: nationalIdFront !== undefined ? nationalIdFront : undefined,
      nationalIdBack: nationalIdBack !== undefined ? nationalIdBack : undefined,
      selfieWithId: selfieWithId !== undefined ? selfieWithId : undefined,
      criminalRecord: criminalRecord !== undefined ? criminalRecord : undefined,
      utilityBillUrl: utilityBillUrl !== undefined ? utilityBillUrl : undefined,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true
        }
      }
    }
  });

  if (profession) {
    try {
      await prisma.workerSpecialization.deleteMany({
        where: { workerId: id }
      });

      const catSlug = getCategorySlugFromProfession(profession);

      const service = await prisma.service.findFirst({
        where: { category: { slug: catSlug } }
      });

      if (service) {
        await prisma.workerSpecialization.create({
          data: {
            workerId: id,
            serviceId: service.id
          }
        });
      }
    } catch (e) {
      console.error("Failed to sync specialization on profession update:", e);
    }
  }

  response.json(successResponse(updatedWorker, "Worker profile updated successfully"));
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

// --- SERVICE CATEGORIES MANAGEMENT ---

const updateCategorySchema = z.object({
  nameAr: z.string().optional(),
  nameEn: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional()
});

// GET /api/admin/services/categories — List all service categories for admin
router.get("/services/categories", catchAsync(async (_request, response) => {
  let categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" }
  });

  // If empty, seed from default categories
  if (categories.length === 0) {
    const defaultImages: Record<string, string> = {
      "electrical": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "plumbing": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop&v=osta5",
      "carpentry": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "ac": "/images/services/ac.jpg",
      "appliances": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "painting": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "aluminum": "/images/services/aluminum.jpg",
      "networks": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "computer-repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4",
      "cctv": "/images/services/cam.jpg"
    };

    const { serviceCategories: defaultCats } = await import("../../data/services.js");

    let i = 0;
    for (const cat of defaultCats) {
      const slug = cat.slug;
      await prisma.serviceCategory.upsert({
        where: { slug },
        update: {},
        create: {
          nameAr: cat.name.ar,
          nameEn: cat.name.en,
          slug,
          icon: cat.icon,
          imageUrl: defaultImages[slug] || null,
          sortOrder: i++,
          isActive: true
        }
      });
    }

    categories = await prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" }
    });
  }

  response.json(successResponse(categories, "Service categories fetched successfully"));
}));

// PUT /api/admin/services/categories/:id — Update a service category
router.put("/services/categories/:id", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const payload = updateCategorySchema.parse(request.body ?? {});

  const category = await prisma.serviceCategory.findUnique({
    where: { id }
  });

  if (!category) {
    response.status(404).json({ success: false, message: "Category not found", error: "NOT_FOUND" });
    return;
  }

  const updated = await prisma.serviceCategory.update({
    where: { id },
    data: {
      nameAr: payload.nameAr !== undefined ? payload.nameAr : category.nameAr,
      nameEn: payload.nameEn !== undefined ? payload.nameEn : category.nameEn,
      icon: payload.icon !== undefined ? payload.icon : category.icon,
      imageUrl: payload.imageUrl !== undefined ? payload.imageUrl : category.imageUrl,
      sortOrder: payload.sortOrder !== undefined ? payload.sortOrder : category.sortOrder,
      isActive: payload.isActive !== undefined ? payload.isActive : category.isActive
    }
  });

  response.json(successResponse(updated, "Service category updated successfully"));
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

// ──────────────────────────────────────────────────────────────────────────────
// Hero Slides — metadata stored in SystemSetting, images stored in Vercel Blob.
// ──────────────────────────────────────────────────────────────────────────────

const SLIDES_KEY = "hero_slides";

// GET /api/admin/slides — Get current hero slides
router.get("/slides", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (_req, res) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key: SLIDES_KEY } });
  const slides = setting ? JSON.parse(setting.value) : [];
  res.json(successResponse(slides, "Hero slides fetched"));
}));

// PUT /api/admin/slides — Save hero slides
router.put("/slides", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { slides } = req.body;
  if (!Array.isArray(slides)) throw new ApiError(400, "slides must be an array");
  const normalized = await normalizeHeroSlidesForStorage(slides);

  await prisma.systemSetting.upsert({
    where: { key: SLIDES_KEY },
    update: { value: JSON.stringify(normalized.slides), type: "json" },
    create: { key: SLIDES_KEY, value: JSON.stringify(normalized.slides), type: "json" }
  });

  res.json(successResponse(normalized.slides, "Hero slides saved"));
}));

// ──────────────────────────────────────────────────────────────────────────────
// Mobile Hero Slides — stored separately in SystemSetting as hero_slides_mobile
// ──────────────────────────────────────────────────────────────────────────────

const MOBILE_SLIDES_KEY = "hero_slides_mobile";

// GET /api/admin/mobile-slides — Get current mobile hero slides
router.get("/mobile-slides", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (_req, res) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key: MOBILE_SLIDES_KEY } });
  const slides = setting ? JSON.parse(setting.value) : [];
  res.json(successResponse(slides, "Mobile hero slides fetched"));
}));

// PUT /api/admin/mobile-slides — Save mobile hero slides
router.put("/mobile-slides", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { slides } = req.body;
  if (!Array.isArray(slides)) throw new ApiError(400, "slides must be an array");
  // Use same normalization helper as desktop slides
  const normalized = await normalizeHeroSlidesForStorage(slides);

  await prisma.systemSetting.upsert({
    where: { key: MOBILE_SLIDES_KEY },
    update: { value: JSON.stringify(normalized.slides), type: "json" },
    create: { key: MOBILE_SLIDES_KEY, value: JSON.stringify(normalized.slides), type: "json" }
  });

  res.json(successResponse(normalized.slides, "Mobile hero slides saved"));
}));

// Sponsored Campaigns — stored in SystemSetting table as JSON
const CAMPAIGNS_KEY = "sponsored_campaigns";

// GET /api/admin/campaigns — Get current sponsored campaigns
router.get("/campaigns", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (_req, res) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key: CAMPAIGNS_KEY } });
  const campaigns = setting ? JSON.parse(setting.value) : [];
  res.json(successResponse(campaigns, "Sponsored campaigns fetched"));
}));

// PUT /api/admin/campaigns — Save sponsored campaigns
router.put("/campaigns", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { campaigns } = req.body;
  if (!Array.isArray(campaigns)) throw new ApiError(400, "campaigns must be an array");
  const normalized = await normalizeCampaignsForStorage(campaigns);

  await prisma.systemSetting.upsert({
    where: { key: CAMPAIGNS_KEY },
    update: { value: JSON.stringify(normalized.campaigns), type: "json" },
    create: { key: CAMPAIGNS_KEY, value: JSON.stringify(normalized.campaigns), type: "json" }
  });

  res.json(successResponse(normalized.campaigns, "Sponsored campaigns saved"));
}));

// ──────────────────────────────────────────────────────────────────────────────
// Worker Avatar Library — admin-approved photos randomly assigned to workers
// who complete registration without uploading a profile photo.
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/admin/avatars — Get current avatar library
router.get("/avatars", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (_req, res) => {
  const avatars = await getAvatarLibrary();
  res.json(successResponse(avatars, "Avatar library fetched"));
}));

// PUT /api/admin/avatars — Save avatar library
router.put("/avatars", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { avatars } = req.body;
  if (!Array.isArray(avatars)) throw new ApiError(400, "avatars must be an array");

  const saved = await saveAvatarLibrary(avatars);
  res.json(successResponse(saved, "Avatar library saved"));
}));

// ──────────────────────────────────────────────────────────────────────────────
// Admin Media Folders & Organized Storage API
// Groups all documents, avatars, and attachments by Entity (Workers, Clients, Vendors)
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/admin/media/folders — Get structured media organized by entity folders
router.get("/media/folders", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (_req, res) => {
  // 1. Technicians / Workers with documents & photos
  const workers = await prisma.workerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          avatarUrl: true
        }
      },
      certificates: {
        select: { id: true, title: true, imageUrl: true, createdAt: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const workerFolders = workers.map(w => {
    const files: Array<{
      id: string;
      url: string;
      titleAr: string;
      titleEn: string;
      category: string;
      field?: string;
      uploadedAt?: string | Date | null;
    }> = [];

    if (w.user.avatarUrl) {
      files.push({
        id: `${w.id}-avatar`,
        url: w.user.avatarUrl,
        titleAr: "الصورة الشخصية للفني",
        titleEn: "Worker Avatar",
        category: "avatar",
        field: "avatarUrl",
        uploadedAt: w.updatedAt
      });
    }

    if (w.nationalIdFront) {
      files.push({
        id: `${w.id}-id-front`,
        url: w.nationalIdFront,
        titleAr: "وجه بطاقة الرقم القومي",
        titleEn: "National ID Front",
        category: "national_id",
        field: "nationalIdFront",
        uploadedAt: w.updatedAt
      });
    }

    if (w.nationalIdBack) {
      files.push({
        id: `${w.id}-id-back`,
        url: w.nationalIdBack,
        titleAr: "ظهر بطاقة الرقم القومي",
        titleEn: "National ID Back",
        category: "national_id",
        field: "nationalIdBack",
        uploadedAt: w.updatedAt
      });
    }

    if (w.selfieWithId) {
      files.push({
        id: `${w.id}-selfie`,
        url: w.selfieWithId,
        titleAr: "سيلفي الفني مع البطاقة",
        titleEn: "Selfie with ID",
        category: "selfie",
        field: "selfieWithId",
        uploadedAt: w.updatedAt
      });
    }

    if (w.criminalRecord) {
      files.push({
        id: `${w.id}-criminal`,
        url: w.criminalRecord,
        titleAr: "صحيفة الحالة الجنائية (الفيش)",
        titleEn: "Criminal Record",
        category: "criminal_record",
        field: "criminalRecord",
        uploadedAt: w.updatedAt
      });
    }

    if (w.utilityBillUrl) {
      files.push({
        id: `${w.id}-utility`,
        url: w.utilityBillUrl,
        titleAr: "إيصال المرافق (غاز/كهرباء/مياه)",
        titleEn: "Utility Bill",
        category: "utility_bill",
        field: "utilityBillUrl",
        uploadedAt: w.updatedAt
      });
    }

    if (Array.isArray(w.galleryImages)) {
      w.galleryImages.forEach((img, idx) => {
        if (img) {
          files.push({
            id: `${w.id}-gallery-${idx}`,
            url: img,
            titleAr: `معرض الأعمال #${idx + 1}`,
            titleEn: `Portfolio #${idx + 1}`,
            category: "portfolio",
            uploadedAt: w.updatedAt
          });
        }
      });
    }

    w.certificates.forEach((cert, idx) => {
      if (cert.imageUrl) {
        files.push({
          id: cert.id,
          url: cert.imageUrl,
          titleAr: cert.title || `شهادة اعتماد #${idx + 1}`,
          titleEn: cert.title || `Certificate #${idx + 1}`,
          category: "certificate",
          uploadedAt: cert.createdAt
        });
      }
    });

    return {
      id: w.id,
      userId: w.userId,
      type: "worker" as const,
      name: `${w.user.firstName} ${w.user.lastName}`,
      phone: w.user.phone,
      email: w.user.email,
      profession: w.profession,
      status: w.verificationStatus,
      avatarUrl: w.user.avatarUrl,
      filesCount: files.length,
      files
    };
  }).filter(folder => folder.files.length > 0);

  // 2. Clients with files & request attachments
  const clients = await prisma.clientProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          avatarUrl: true
        }
      },
      requests: {
        select: {
          id: true,
          title: true,
          images: true,
          beforeImages: true,
          afterImages: true,
          createdAt: true
        },
        take: 30
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const clientFolders = clients.map(c => {
    const files: Array<{
      id: string;
      url: string;
      titleAr: string;
      titleEn: string;
      category: string;
      field?: string;
      uploadedAt?: string | Date | null;
    }> = [];

    if (c.user.avatarUrl) {
      files.push({
        id: `${c.id}-avatar`,
        url: c.user.avatarUrl,
        titleAr: "الصورة الشخصية للعميل",
        titleEn: "Client Avatar",
        category: "avatar",
        field: "avatarUrl",
        uploadedAt: c.updatedAt
      });
    }

    c.requests.forEach(r => {
      const allReqImages = [...(r.images || []), ...(r.beforeImages || []), ...(r.afterImages || [])];
      allReqImages.forEach((img, idx) => {
        if (img) {
          files.push({
            id: `${r.id}-${idx}`,
            url: img,
            titleAr: `مرفق طلب: ${r.title || "طلب صيانة"}`,
            titleEn: `Request Attachment: ${r.title || "Service Request"}`,
            category: "request_attachment",
            uploadedAt: r.createdAt
          });
        }
      });
    });

    return {
      id: c.id,
      userId: c.userId,
      type: "client" as const,
      name: `${c.user.firstName} ${c.user.lastName}`,
      phone: c.user.phone,
      email: c.user.email,
      avatarUrl: c.user.avatarUrl,
      filesCount: files.length,
      files
    };
  }).filter(folder => folder.files.length > 0);

  // 3. Vendors & Stores with documents & products
  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      },
      products: {
        select: {
          id: true,
          nameAr: true,
          imageUrl: true,
          createdAt: true
        },
        take: 30
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const vendorFolders = vendors.map(v => {
    const files: Array<{
      id: string;
      url: string;
      titleAr: string;
      titleEn: string;
      category: string;
      field?: string;
      uploadedAt?: string | Date | null;
    }> = [];

    if (v.shopImageUrl) {
      files.push({
        id: `${v.id}-shop-image`,
        url: v.shopImageUrl,
        titleAr: "شعار / صورة المتجر",
        titleEn: "Shop Logo / Image",
        category: "shop_logo",
        field: "shopImageUrl",
        uploadedAt: v.updatedAt
      });
    }

    if (v.commercialRegisterUrl) {
      files.push({
        id: `${v.id}-commercial-register`,
        url: v.commercialRegisterUrl,
        titleAr: "السجل التجاري للمتجر",
        titleEn: "Commercial Register",
        category: "commercial_register",
        field: "commercialRegisterUrl",
        uploadedAt: v.updatedAt
      });
    }

    if (v.taxCardUrl) {
      files.push({
        id: `${v.id}-tax-card`,
        url: v.taxCardUrl,
        titleAr: "البطاقة الضريبية للمتجر",
        titleEn: "Tax Card",
        category: "tax_card",
        field: "taxCardUrl",
        uploadedAt: v.updatedAt
      });
    }

    v.products.forEach(p => {
      if (p.imageUrl) {
        files.push({
          id: p.id,
          url: p.imageUrl,
          titleAr: `صورة منتج: ${p.nameAr || "منتج"}`,
          titleEn: `Product Image: ${p.nameAr || "Product"}`,
          category: "product",
          uploadedAt: p.createdAt
        });
      }
    });

    return {
      id: v.id,
      userId: v.userId,
      type: "vendor" as const,
      name: v.shopName || `${v.user.firstName} ${v.user.lastName}`,
      phone: v.user.phone,
      email: v.user.email,
      category: v.category,
      filesCount: files.length,
      files
    };
  }).filter(folder => folder.files.length > 0);

  // 4. Avatar library templates
  const avatars = await getAvatarLibrary();

  res.json(successResponse({
    workers: workerFolders,
    clients: clientFolders,
    vendors: vendorFolders,
    avatars
  }, "Media folders fetched successfully"));
}));

// DELETE /api/admin/media/entity-file — Delete or clear a specific document on an entity
router.delete("/media/entity-file", authenticate, requireRoles(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { entityType, entityId, field, fileUrl } = req.body as {
    entityType: "worker" | "client" | "vendor";
    entityId: string;
    field?: string;
    fileUrl?: string;
  };

  if (!entityId || !entityType) {
    throw new ApiError(400, "entityId and entityType are required");
  }

  if (entityType === "worker") {
    const worker = await prisma.workerProfile.findUnique({ where: { id: entityId } });
    if (!worker) throw new ApiError(404, "Worker not found");

    if (field === "avatarUrl") {
      await prisma.user.update({ where: { id: worker.userId }, data: { avatarUrl: null } });
    } else if (field && ["nationalIdFront", "nationalIdBack", "selfieWithId", "criminalRecord", "utilityBillUrl"].includes(field)) {
      await prisma.workerProfile.update({
        where: { id: entityId },
        data: { [field]: null }
      });
    } else if (fileUrl && Array.isArray(worker.galleryImages)) {
      await prisma.workerProfile.update({
        where: { id: entityId },
        data: { galleryImages: worker.galleryImages.filter(img => img !== fileUrl) }
      });
    }
  } else if (entityType === "client") {
    const client = await prisma.clientProfile.findUnique({ where: { id: entityId } });
    if (!client) throw new ApiError(404, "Client not found");
    if (field === "avatarUrl") {
      await prisma.user.update({ where: { id: client.userId }, data: { avatarUrl: null } });
    }
  } else if (entityType === "vendor") {
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: entityId } });
    if (!vendor) throw new ApiError(404, "Vendor not found");
    if (field && ["shopImageUrl", "commercialRegisterUrl", "taxCardUrl"].includes(field)) {
      await prisma.vendorProfile.update({
        where: { id: entityId },
        data: { [field]: null }
      });
    }
  }

  res.json(successResponse(null, "Document cleared successfully"));
}));

export const adminRouter = router;

