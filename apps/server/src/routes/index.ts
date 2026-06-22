import { Router } from "express";

import { adminRouter } from "../modules/admin/admin.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { clientsRouter } from "../modules/clients/clients.routes.js";
import { servicesRouter } from "../modules/services/services.routes.js";
import { workersRouter } from "../modules/workers/workers.routes.js";
import { successResponse } from "../utils/ApiResponse.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.status(200).json(successResponse({ status: "ok" }, "OSTA API is running"));
});

import { vendorRouter } from "../modules/vendors/vendor.routes.js";
import { materialsRouter } from "../modules/materials/materials.routes.js";
import { adsRouter } from "../modules/ads/ads.routes.js";
import { settingsRouter } from "../modules/settings/settings.routes.js";
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";
import { chatRouter } from "../modules/chat/chat.routes.js";
import { reviewsRouter } from "../modules/reviews/reviews.routes.js";

router.get("/public/workers", async (request, response) => {
  const { specialty, governorate, city, area } = request.query as {
    specialty?: string;
    governorate?: string;
    city?: string;
    area?: string;
  };

  try {
    let workers: any[] = [];
    let isFallback = false;

    if (area) {
      // 1. Search in the exact area
      workers = await prisma.workerProfile.findMany({
        where: {
          verificationStatus: "VERIFIED",
          user: { status: "ACTIVE" },
          specializations: {
            some: specialty
              ? { service: { category: { slug: specialty } } }
              : {},
          },
          ...(specialty && {
            specializations: {
              some: { service: { category: { slug: specialty } } }
            }
          }),
          workAreas: {
            some: {
              governorate: governorate || undefined,
              city: city || undefined,
              area
            }
          }
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          specializations: { include: { service: { include: { category: true } } } },
          workAreas: true,
        }
      });
    }

    // 2. Fallback to same city if area query returned no results
    if (workers.length === 0 && city) {
      if (area) isFallback = true;
      workers = await prisma.workerProfile.findMany({
        where: {
          verificationStatus: "VERIFIED",
          user: { status: "ACTIVE" },
          specializations: {
            some: specialty
              ? { service: { category: { slug: specialty } } }
              : {},
          },
          ...(specialty && {
            specializations: {
              some: { service: { category: { slug: specialty } } }
            }
          }),
          workAreas: {
            some: {
              governorate: governorate || undefined,
              city
            }
          }
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          specializations: { include: { service: { include: { category: true } } } },
          workAreas: true,
        }
      });
    }

    // 3. Fallback to same governorate if city query returned no results
    if (workers.length === 0 && governorate) {
      if (area || city) isFallback = true;
      workers = await prisma.workerProfile.findMany({
        where: {
          verificationStatus: "VERIFIED",
          user: { status: "ACTIVE" },
          specializations: {
            some: specialty
              ? { service: { category: { slug: specialty } } }
              : {},
          },
          ...(specialty && {
            specializations: {
              some: { service: { category: { slug: specialty } } }
            }
          }),
          workAreas: {
            some: {
              governorate
            }
          }
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          specializations: { include: { service: { include: { category: true } } } },
          workAreas: true,
        }
      });
    }

    // 4. Default: No location filters (except specialty if provided)
    if (workers.length === 0 && !governorate && !city && !area) {
      workers = await prisma.workerProfile.findMany({
        where: {
          verificationStatus: "VERIFIED",
          user: { status: "ACTIVE" },
          specializations: {
            some: specialty
              ? { service: { category: { slug: specialty } } }
              : {},
          },
          ...(specialty && {
            specializations: {
              some: { service: { category: { slug: specialty } } }
            }
          })
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          specializations: { include: { service: { include: { category: true } } } },
          workAreas: true,
        }
      });
    }

    // Sort workers: Featured first, then highest rating, then completed jobs
    const sortedWorkers = workers.sort((a, b) => {
      const aFeatured = a.subscriptionTier === "featured" ? 1 : 0;
      const bFeatured = b.subscriptionTier === "featured" ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.totalJobsCompleted - a.totalJobsCompleted;
    });

    const result = sortedWorkers.map((w) => ({
      id: w.id,
      name: `${w.user.firstName} ${w.user.lastName}`,
      avatarUrl: w.user.avatarUrl,
      professionAr: w.specializations[0]?.service.category.nameAr || "",
      professionEn: w.specializations[0]?.service.category.nameEn || "",
      categoryId: w.specializations[0]?.service.category.slug || "",
      serviceId: w.specializations[0]?.service.id || "",
      rating: w.rating,
      ratingCount: w.ratingCount,
      totalJobs: w.totalJobsCompleted,
      isOnline: w.isOnline,
      isAvailable: w.isAvailable,
      isFeatured: w.subscriptionTier === "featured",
      isNearby: isFallback,
      areas: w.workAreas.map((wa: any) => wa.area || wa.city),
    }));

    response.status(200).json(successResponse(result, "Public workers list fetched"));
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});

router.get("/public/workers/:id", async (request, response) => {
  const { id } = request.params;
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
        specializations: { include: { service: { include: { category: true } } } },
        workAreas: true,
      }
    });

    if (!worker || worker.verificationStatus !== "VERIFIED" || worker.specializations.length === 0) {
      return response.status(404).json({ error: "Worker not found" });
    }

    // Fetch reviews for the worker's user
    const reviews = await prisma.review.findMany({
      where: { targetId: worker.userId },
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const result = {
      id: worker.id,
      userId: worker.userId,
      name: `${worker.user.firstName} ${worker.user.lastName}`,
      avatarUrl: worker.user.avatarUrl,
      professionAr: worker.specializations[0]?.service.category.nameAr || "",
      professionEn: worker.specializations[0]?.service.category.nameEn || "",
      categoryId: worker.specializations[0]?.service.category.slug || "",
      serviceId: worker.specializations[0]?.service.id || "",
      rating: worker.rating,
      ratingCount: worker.ratingCount,
      totalJobs: worker.totalJobsCompleted,
      isOnline: worker.isOnline,
      isAvailable: worker.isAvailable,
      isFeatured: worker.subscriptionTier === "featured",
      areas: worker.workAreas.map((wa: any) => wa.area || wa.city),
      bio: worker.bio,
      joinedAt: worker.user.createdAt,
      reviews: reviews.map(r => ({
        id: r.id,
        authorName: `${r.author.firstName} ${r.author.lastName}`,
        authorAvatar: r.author.avatarUrl,
        rating: r.overallRating,
        comment: r.comment,
        createdAt: r.createdAt
      }))
    };

    response.status(200).json(successResponse(result, "Worker profile fetched"));
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});

router.get("/public/requests", async (request, response) => {
  const { specialty } = request.query as { specialty?: string };

  try {
    const openRequests = await prisma.serviceRequest.findMany({
      where: {
        status: "PENDING",
        workerId: null,
        ...(specialty && {
          service: {
            category: {
              slug: specialty,
            },
          },
        }),
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const result = openRequests.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description.length > 150 ? `${r.description.substring(0, 150)}...` : r.description,
      urgency: r.urgency,
      serviceNameAr: r.service.nameAr,
      serviceNameEn: r.service.nameEn,
      categorySlug: r.service.category.slug,
      categoryNameAr: r.service.category.nameAr,
      categoryNameEn: r.service.category.nameEn,
      governorate: r.address.governorate,
      city: r.address.city,
      createdAt: r.createdAt,
    }));

    // Sort public requests: EMERGENCY first, then newest first
    result.sort((a, b) => {
      const aUrgent = a.urgency === "EMERGENCY" ? 1 : 0;
      const bUrgent = b.urgency === "EMERGENCY" ? 1 : 0;
      if (aUrgent !== bUrgent) return bUrgent - aUrgent;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    response.status(200).json(successResponse(result, "Public open requests fetched"));
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});

router.get("/public/requests/:id", async (request, response) => {
  const { id } = request.params;

  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            category: true,
          },
        },
        address: true,
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    if (!serviceRequest) {
      return response.status(404).json({ error: "Order not found" });
    }

    const result = {
      id: serviceRequest.id,
      requestNumber: serviceRequest.requestNumber,
      title: serviceRequest.title,
      description: serviceRequest.description,
      urgency: serviceRequest.urgency,
      serviceNameAr: serviceRequest.service.nameAr,
      serviceNameEn: serviceRequest.service.nameEn,
      categorySlug: serviceRequest.service.category.slug,
      categoryNameAr: serviceRequest.service.category.nameAr,
      categoryNameEn: serviceRequest.service.category.nameEn,
      createdAt: serviceRequest.createdAt,
      preferredDate: serviceRequest.preferredDate,
      preferredTimeSlot: serviceRequest.preferredTimeSlot,
      estimatedPrice: serviceRequest.estimatedPrice,
      offersCount: serviceRequest._count.offers,
      address: {
        governorate: serviceRequest.address.governorate,
        city: serviceRequest.address.city,
        area: serviceRequest.address.area,
        street: serviceRequest.address.street,
        building: serviceRequest.address.building,
        floor: serviceRequest.address.floor,
        apartment: serviceRequest.address.apartment,
        landmark: serviceRequest.address.landmark,
      },
    };

    response.status(200).json(successResponse(result, "Public request details fetched"));
  } catch (e: any) {
    response.status(500).json({ error: e.message });
  }
});


// GET /api/public/slides — Public hero slides (no auth required)
router.get("/public/slides", async (_req, response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "hero_slides" } });
    const slides = setting ? JSON.parse(setting.value) : [];
    response.json({ success: true, data: slides });
  } catch (e: any) {
    response.json({ success: true, data: [] });
  }
});

router.use("/auth", authRouter);
router.use("/clients", clientsRouter);
router.use("/workers", workersRouter);
router.use("/admin", adminRouter);
router.use("/services", servicesRouter);
router.use("/vendors", vendorRouter);
router.use("/materials", materialsRouter);
router.use("/ads", adsRouter);
router.use("/settings", settingsRouter);
router.use("/notifications", notificationsRouter);
router.use("/chat", chatRouter);
router.use("/reviews", reviewsRouter);

export const apiRouter = router;
