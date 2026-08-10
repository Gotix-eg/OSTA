import { Router } from "express";

import { adminRouter } from "../modules/admin/admin.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { clientsRouter } from "../modules/clients/clients.routes.js";
import { servicesRouter } from "../modules/services/services.routes.js";
import { workersRouter } from "../modules/workers/workers.routes.js";
import { successResponse } from "../utils/ApiResponse.js";
import { isWorkerAvailableNow } from "../utils/worker-availability.util.js";
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

export function getCategorySlugFromProfession(profession: string | null | undefined): string {
  if (!profession) return "electrical";
  const p = profession.toLowerCase().trim();
  if (p.includes("نجار") || p.includes("carp")) return "carpentry";
  if (p.includes("سباك") || p.includes("سبا") || p.includes("plumb")) return "plumbing";
  if (p.includes("كهرب") || p.includes("electr")) return "electrical";
  if (p.includes("تكيي") || p.includes("ac")) return "ac";
  if (p.includes("نقاش") || p.includes("دهان") || p.includes("paint")) return "painting";
  if (p.includes("الوم") || p.includes("aluminum")) return "aluminum";
  if (p.includes("شبك") || p.includes("network")) return "networks";
  if (p.includes("كمبيو") || p.includes("comput") || p.includes("pc")) return "computer";
  if (p.includes("كامير") || p.includes("cctv")) return "cameras";
  if (p.includes("جهز") || p.includes("appliance")) return "appliances";
  if (p.includes("مبلط") || p.includes("سيراميك") || p.includes("رخام") || p.includes("tile")) return "tiling";
  if (p.includes("محارة") || p.includes("plaster")) return "plastering";
  if (p.includes("حداد") || p.includes("iron") || p.includes("weld")) return "ironwork";
  if (p.includes("تشطيب") || p.includes("finish")) return "finishing";
  if (p.includes("جبس") || p.includes("gypsum")) return "gypsum";
  if (p.includes("نقل") || p.includes("move") || p.includes("moving")) return "moving";
  if (p.includes("نظاف") || p.includes("clean") || p.includes("حشرات")) return "cleaning";
  if (p.includes("ميكانيكي سيار") || p.includes("car-mech") || p.includes("ميكانيك سيار")) return "car-mechanic";
  if (p.includes("موتوسيك") || p.includes("bike") || p.includes("اسكوتر")) return "bike-mechanic";
  if (p.includes("موتور") || p.includes("مواتير") || p.includes("engine") || p.includes("مضخ")) return "engine-repair";
  if (p.includes("مصاعد") || p.includes("مصعد") || p.includes("elevator")) return "elevators";
  if (p.includes("زجاج") || p.includes("مرايا") || p.includes("glass") || p.includes("شاور")) return "glass";
  if (p.includes("ستائر") || p.includes("ستارة") || p.includes("blinds") || p.includes("curtain")) return "curtains";
  if (p.includes("باركيه") || p.includes("أرضيات") || p.includes("flooring") || p.includes("parquet")) return "flooring";
  if (p.includes("دش") || p.includes("ستالايت") || p.includes("dish") || p.includes("satellite")) return "satellite";
  if (p.includes("انتركم") || p.includes("أقفال") || p.includes("smart") || p.includes("intercom")) return "smart-home";
  if (p.includes("عزل") || p.includes("insulation") || p.includes("proof")) return "insulation";
  if (p.includes("شمسية") || p.includes("solar")) return "solar";
  if (p.includes("حدائق") || p.includes("زراعة") || p.includes("garden") || p.includes("landscape")) return "gardening";
  if (p.includes("تنجيد") || p.includes("upholstery") || p.includes("أنتريه")) return "upholstery";
  if (p.includes("غاز") || p.includes("gas")) return "gas";
  if (p.includes("سباحة") || p.includes("مسبح") || p.includes("pool")) return "pools";
  if (p.includes("سمكري") || p.includes("دوكو") || p.includes("car-body")) return "car-body";
  if (p.includes("مفاتيح") || p.includes("تشفير") || p.includes("locksmith") || p.includes("car-key")) return "car-keys";
  if (p.includes("صيانة عامة") || p.includes("عامل") || p.includes("handyman")) return "handyman";
  return "electrical";
}

router.get("/public/workers", async (request, response) => {
  const { specialty, governorate, city, area } = request.query as {
    specialty?: string;
    governorate?: string;
    city?: string;
    area?: string;
  };

  try {
    // Auto-fix any verified workers missing specializations or workAreas so they immediately appear on homepage
    try {
      const brokenWorkers = await prisma.workerProfile.findMany({
        where: {
          verificationStatus: "VERIFIED",
          OR: [
            { specializations: { none: {} } },
            { workAreas: { none: {} } }
          ]
        },
        include: {
          user: { include: { addresses: { take: 1 } } }
        }
      });

      for (const w of brokenWorkers) {
        // Create specialization if missing
        const hasSpec = await prisma.workerSpecialization.count({ where: { workerId: w.id } });
        if (hasSpec === 0) {
          const catSlug = getCategorySlugFromProfession(w.profession);

          const service = await prisma.service.findFirst({
            where: { category: { slug: catSlug } }
          });

          if (service) {
            await prisma.workerSpecialization.create({
              data: { workerId: w.id, serviceId: service.id }
            }).catch(() => {});
          }
        }

        // Create workArea if missing
        const hasArea = await prisma.workerArea.count({ where: { workerId: w.id } });
        if (hasArea === 0) {
          const address = w.user.addresses[0];
          await prisma.workerArea.create({
            data: {
              workerId: w.id,
              governorate: address?.governorate || "cairo",
              city: address?.city || "new-cairo",
              area: address?.area || "5th-settlement"
            }
          }).catch(() => {});
        }
      }
    } catch (fixErr) {
      console.error("Auto-fix workers failed:", fixErr);
    }

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
      isOnline: isWorkerAvailableNow({
        isAvailable: w.isAvailable,
        workingHours: w.workingHours,
        offDates: w.offDates,
      }),
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

import { getToken } from "../middleware/auth.middleware.js";
import { verifyAccessToken } from "../utils/tokens.js";

router.get("/public/workers/:id", async (request, response) => {
  const { id } = request.params;
  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
        specializations: { include: { service: { include: { category: true } } } },
        workAreas: true,
        certificates: { orderBy: { order: "asc" } },
        serviceItems: { orderBy: { order: "asc" } },
      } as any
    });

    if (!worker) {
      return response.status(404).json({ error: "Worker not found" });
    }

    let isOwnerOrAdmin = false;
    const token = getToken(request);
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload && (payload.sub === worker.userId || payload.role === "ADMIN")) {
          isOwnerOrAdmin = true;
        }
      } catch (err) {
        // ignore
      }
    }

    const specializations = (worker as any).specializations ?? [];
    if (!isOwnerOrAdmin && (worker.verificationStatus !== "VERIFIED" || specializations.length === 0)) {
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
      name: `${(worker as any).user?.firstName ?? ""} ${(worker as any).user?.lastName ?? ""}`.trim(),
      avatarUrl: (worker as any).user?.avatarUrl ?? null,
      professionAr: specializations[0]?.service?.category?.nameAr || "",
      professionEn: specializations[0]?.service?.category?.nameEn || "",
      categoryId: specializations[0]?.service?.category?.slug || "",
      serviceId: specializations[0]?.service?.id || "",
      rating: worker.rating,
      ratingCount: worker.ratingCount,
      totalJobs: worker.totalJobsCompleted,
      isOnline: isWorkerAvailableNow({
        isAvailable: worker.isAvailable,
        workingHours: (worker as any).workingHours,
        offDates: (worker as any).offDates,
      }),
      isAvailable: worker.isAvailable,
      isFeatured: (worker as any).subscriptionTier === "featured",
      areas: ((worker as any).workAreas ?? []).map((wa: any) => wa.area || wa.city),
      bio: worker.bio,
      yearsOfExperience: worker.yearsOfExperience,
      education: (worker as any).education ?? [],
      achievements: (worker as any).achievements ?? [],
      galleryImages: worker.galleryImages,
      galleryVideoUrl: (worker as any).galleryVideoUrl ?? null,
      contractInfo: (worker as any).contractInfo ?? null,
      certificates: ((worker as any).certificates ?? []).map((c: any) => ({ id: c.id, title: c.title, year: c.year, imageUrl: c.imageUrl })),
      serviceItems: ((worker as any).serviceItems ?? []).map((s: any) => ({ id: s.id, name: s.name, price: s.price, note: s.note })),
      joinedAt: (worker as any).user?.createdAt,
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

router.get("/public/fix-specialties", async (request, response) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      include: {
        user: true,
        specializations: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    const logs: string[] = [];
    logs.push(`Found ${workers.length} total workers in the database.`);

    for (const w of workers) {
      const correctSlug = getCategorySlugFromProfession(w.profession);
      const currentSlug = w.specializations[0]?.service?.category?.slug || "";

      if (currentSlug !== correctSlug) {
        logs.push(`Mismatch detected for worker: ${w.user?.firstName} ${w.user?.lastName} (ID: ${w.id})`);
        logs.push(`- Profession: "${w.profession}"`);
        logs.push(`- Current category: "${currentSlug}"`);
        logs.push(`- Correct category: "${correctSlug}"`);

        const service = await prisma.service.findFirst({
          where: { category: { slug: correctSlug } }
        });

        if (service) {
          await prisma.workerSpecialization.deleteMany({
            where: { workerId: w.id }
          });

          await prisma.workerSpecialization.create({
            data: {
              workerId: w.id,
              serviceId: service.id
            }
          });

          logs.push(`=> Successfully updated specialization to "${correctSlug}"`);
        } else {
          logs.push(`=> Warning: Could not find any service for category "${correctSlug}"`);
        }
      }
    }

    response.status(200).json(successResponse({ logs }, "Specialties fix executed"));
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
    const activeSlides = Array.isArray(slides) ? slides.filter((s: any) => s.isActive !== false) : [];

    const campaignsSetting = await prisma.systemSetting.findUnique({ where: { key: "sponsored_campaigns" } });
    const rawCampaigns = campaignsSetting ? JSON.parse(campaignsSetting.value) : [];
    const activeCampaigns = Array.isArray(rawCampaigns) ? rawCampaigns.filter((c: any) => c.isActive !== false) : [];

    const mappedCampaigns = activeCampaigns.map((c: any) => ({
      id: c.id,
      eyebrowAr: "إعلان ممول",
      eyebrowEn: "Sponsored Ad",
      titleAr: c.titleAr || "",
      titleEn: c.titleEn || "",
      descAr: c.descAr || "",
      descEn: c.descEn || "",
      imageUrl: c.imageUrl || "",
      btn1TextAr: "عرض التفاصيل",
      btn1TextEn: "View Details",
      btn1Link: c.link || "",
      btn2TextAr: "",
      btn2TextEn: "",
      btn2Link: "",
      isActive: true
    }));

    response.json({ success: true, data: [...activeSlides, ...mappedCampaigns] });
  } catch (e: any) {
    response.json({ success: true, data: [] });
  }
});

// GET /api/public/mobile-slides — Public mobile hero slides (no auth required)
router.get("/public/mobile-slides", async (_req, response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "hero_slides_mobile" } });
    const slides = setting ? JSON.parse(setting.value) : [];
    const activeSlides = Array.isArray(slides) ? slides.filter((s: any) => s.isActive !== false) : [];

    const campaignsSetting = await prisma.systemSetting.findUnique({ where: { key: "sponsored_campaigns" } });
    const rawCampaigns = campaignsSetting ? JSON.parse(campaignsSetting.value) : [];
    const activeCampaigns = Array.isArray(rawCampaigns) ? rawCampaigns.filter((c: any) => c.isActive !== false) : [];

    const mappedCampaigns = activeCampaigns.map((c: any) => ({
      id: c.id,
      eyebrowAr: "إعلان ممول",
      eyebrowEn: "Sponsored Ad",
      titleAr: c.titleAr || "",
      titleEn: c.titleEn || "",
      descAr: c.descAr || "",
      descEn: c.descEn || "",
      imageUrl: c.imageUrl || "",
      btn1TextAr: "عرض التفاصيل",
      btn1TextEn: "View Details",
      btn1Link: c.link || "",
      btn2TextAr: "",
      btn2TextEn: "",
      btn2Link: "",
      isActive: true
    }));

    response.json({ success: true, data: [...activeSlides, ...mappedCampaigns] });
  } catch (e: any) {
    response.json({ success: true, data: [] });
  }
});


// GET /api/public/campaigns — Public sponsored campaigns (no auth required)
router.get("/public/campaigns", async (_req, response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "sponsored_campaigns" } });
    const campaigns = setting ? JSON.parse(setting.value) : [];
    response.json({ success: true, data: campaigns.filter((c: any) => c.isActive !== false) });
  } catch (e: any) {
    response.json({ success: true, data: [] });
  }
});

router.get("/test-email", async (request, response) => {
  try {
    const to = (request.query.to as string) || "info@ostafy.com";
    console.log(`[TestEmail] Testing welcome email to ${to}...`);
    const { transporter, sendWelcomeEmail } = await import("../utils/email.js");
    await transporter.verify();
    const info = await sendWelcomeEmail(to, "Test User");
    response.json({
      success: true,
      message: "SMTP verified and email sent successfully!",
      info,
      env: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_FROM: process.env.SMTP_FROM,
        SMTP_SECURE: process.env.SMTP_SECURE,
        hasPass: !!process.env.SMTP_PASS
      }
    });
  } catch (error: any) {
    console.error("[TestEmail] SMTP verification/send failed:", error);
    response.status(500).json({
      success: false,
      message: error.message || "Unknown error",
      error: {
        message: error.message,
        code: error.code,
        command: error.command,
        stack: error.stack
      },
      env: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_FROM: process.env.SMTP_FROM,
        SMTP_SECURE: process.env.SMTP_SECURE,
        hasPass: !!process.env.SMTP_PASS
      }
    });
  }
});

router.post("/upload", async (request, response) => {
  try {
    const { file, name } = request.body;
    if (!file || !name) {
      return response.status(400).json({ error: "Missing file or name" });
    }

    const matches = file.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return response.status(400).json({ error: "Invalid base64 image data" });
    }

    const contentType = matches[2] ? matches[1] : "image/jpeg";
    const base64Data = matches[2] || matches[1];
    const buffer = Buffer.from(base64Data, "base64");

    const { put } = await import("@vercel/blob");

    const folder = name.includes("nid") || name.includes("record") || name.includes("tax")
      ? "registration-documents"
      : "uploads";

    const filename = `${folder}/${Date.now()}-${name}`;
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    response.status(200).json(successResponse({ url: blob.url }, "File uploaded successfully"));
  } catch (error: any) {
    console.error("Express upload error:", error);
    response.status(500).json({ error: error.message || "Upload failed" });
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
