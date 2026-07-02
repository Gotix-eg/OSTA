import { Router } from "express";
import { UserRole } from "@prisma/client";

import { z } from "zod";

import { authenticate, requireRoles } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { ApiError } from "../../utils/ApiError.js";
import { normalizeHeroSlidesForStorage, normalizeCampaignsForStorage } from "./hero-slides.storage.js";

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
  const value = (profession || "").toLowerCase();
  if (value.includes("سبا") || value.includes("plumb")) return "plumber";
  if (value.includes("تكييف") || value.includes("ac")) return "acTechnician";
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
      user: { select: { firstName: true, lastName: true } },
      workAreas: { take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  const today = new Date().toISOString().split("T")[0] ?? "";
  const visibleWorkers: PendingWorkerRecord[] = workers.map((worker) => {
    const documentsReady = [
      worker.nationalIdFront,
      worker.nationalIdBack,
      worker.selfieWithId,
      worker.criminalRecord
    ].filter(Boolean).length;

    return {
      id: worker.id,
      name: `${worker.user.firstName} ${worker.user.lastName}`.trim(),
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
      guarantorPhone: worker.guarantorPhone
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

router.patch("/workers/:id/verify", catchAsync(async (request, response) => {
  const payload = verifyWorkerSchema.parse(request.body ?? {});
  const workerId = request.params.id as string;
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updatedWorker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: payload.status === "VERIFIED"
      ? {
          verificationStatus: "VERIFIED",
          verifiedAt: now,
          trialExpiresAt
        }
      : {
          verificationStatus: "REJECTED"
        },
    include: {
      user: { include: { addresses: { take: 1 } } }
    }
  });

  if (payload.status === "VERIFIED") {
    try {
      // 1. Create specialization if missing
      const hasSpec = await prisma.workerSpecialization.count({ where: { workerId: updatedWorker.id } });
      if (hasSpec === 0) {
        const prof = (updatedWorker.profession || "").toLowerCase();
        let catSlug = "electricity";
        if (prof.includes("سبا") || prof.includes("plumb")) catSlug = "plumbing";
        else if (prof.includes("تكييف") || prof.includes("ac")) catSlug = "ac";
        else if (prof.includes("نجار") || prof.includes("carp")) catSlug = "carpentry";

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
    },
    include: {
      user: { include: { addresses: { take: 1 } } }
    }
  });

  try {
    // 1. Create specialization if missing
    const hasSpec = await prisma.workerSpecialization.count({ where: { workerId: updated.id } });
    if (hasSpec === 0) {
      const prof = (updated.profession || "").toLowerCase();
      let catSlug = "electricity";
      if (prof.includes("سبا") || prof.includes("plumb")) catSlug = "plumbing";
      else if (prof.includes("تكييف") || prof.includes("ac")) catSlug = "ac";
      else if (prof.includes("نجار") || prof.includes("carp")) catSlug = "carpentry";

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

// PATCH /api/admin/workers/:id — Edit worker profile details (first/last name, phone, profession)
router.patch("/workers/:id", catchAsync(async (request, response) => {
  const id = request.params.id as string;
  const { firstName, lastName, phone, profession } = request.body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profession?: string;
  };

  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!worker) {
    throw new ApiError(404, "Worker profile not found");
  }

  if (firstName || lastName || phone) {
    await prisma.user.update({
      where: { id: worker.userId },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        phone: phone !== undefined ? phone : undefined,
      }
    });
  }

  const updatedWorker = await prisma.workerProfile.update({
    where: { id },
    data: {
      profession: profession !== undefined ? profession : undefined
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true
        }
      }
    }
  });

  if (profession && profession !== worker.profession) {
    try {
      await prisma.workerSpecialization.deleteMany({
        where: { workerId: id }
      });

      const prof = profession.toLowerCase();
      let catSlug = "electricity";
      if (prof.includes("سبا") || prof.includes("plumb")) catSlug = "plumbing";
      else if (prof.includes("تكييف") || prof.includes("ac")) catSlug = "ac";
      else if (prof.includes("نجار") || prof.includes("carp")) catSlug = "carpentry";

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

export const adminRouter = router;
