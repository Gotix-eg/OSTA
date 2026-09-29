import { Router } from "express";
import { serviceCategories } from "../../data/services.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();


router.get("/categories", catchAsync(async (_request, response) => {
  const defaultImages: Record<string, string> = {
    "electrical": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
    "electricity": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
    "plumbing": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop",
    "carpentry": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop",
    "ac": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop",
    "appliances": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop",
    "painting": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop",
    "aluminum": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop",
    "networks": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
    "computer-repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop",
    "computer": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop",
    "cctv": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
    "cameras": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop",
    "tiling": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
    "plastering": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop",
    "ironwork": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop",
    "finishing": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    "gypsum": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
    "moving": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=1000&auto=format&fit=crop",
    "cleaning": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop",
    "car-mechanic": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1000&auto=format&fit=crop",
    "bike-mechanic": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop",
    "engine-repair": "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1000&auto=format&fit=crop",
    "elevators": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1000&auto=format&fit=crop",
    "car-body": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop",
    "car-keys": "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1000&auto=format&fit=crop",
    "gas": "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1000&auto=format&fit=crop",
    "pools": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop",
    "handyman": "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1000&auto=format&fit=crop",
    "tailoring": "/images/services/tailoring.png",
    "upholstery": "/images/services/upholstery.png"
  };

  let i = 0;
  for (const cat of serviceCategories) {
    const slug = cat.slug;
    const catImage = defaultImages[slug] || null;
    const category = await prisma.serviceCategory.upsert({
      where: { slug },
      update: {
        nameAr: cat.name.ar,
        nameEn: cat.name.en,
        icon: cat.icon,
        ...(catImage ? { imageUrl: catImage } : {}),
        isActive: true
      },
      create: {
        nameAr: cat.name.ar,
        nameEn: cat.name.en,
        slug,
        icon: cat.icon,
        imageUrl: catImage,
        sortOrder: i++,
        isActive: true
      }
    });

    let j = 0;
    for (const srv of cat.services) {
      await prisma.service.upsert({
        where: { slug: srv.slug },
        update: {
          nameAr: srv.name.ar,
          nameEn: srv.name.en,
          isActive: true
        },
        create: {
          categoryId: category.id,
          nameAr: srv.name.ar,
          nameEn: srv.name.en,
          slug: srv.slug,
          sortOrder: j++,
          isActive: true
        }
      });
    }
  }

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
  });

  response.status(200).json(successResponse(categories, "Service categories fetched"));
}));

router.get("/categories/:slug", catchAsync(async (request, response) => {
  const category = await prisma.serviceCategory.findFirst({
    where: { slug: request.params.slug as string, isActive: true },
    include: { services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
  });

  if (!category) {
    response.status(404).json({ success: false, message: "Category not found", error: "NOT_FOUND" });
    return;
  }

  response.status(200).json(successResponse(category, "Category fetched"));
}));

router.get("/", catchAsync(async (_request, response) => {
  const dbServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      category: {
        select: {
          slug: true,
          nameAr: true,
          nameEn: true
        }
      }
    }
  });

  const mappedServices = dbServices.map(s => ({
    id: s.slug,
    slug: s.slug,
    name: { ar: s.nameAr, en: s.nameEn },
    category: {
      slug: s.category.slug,
      name: { ar: s.category.nameAr, en: s.category.nameEn }
    }
  }));

  response.status(200).json(successResponse(mappedServices, "Services fetched"));
}));

router.get("/:slug", catchAsync(async (request, response) => {
  const dbService = await prisma.service.findFirst({
    where: { slug: request.params.slug as string, isActive: true },
    include: {
      category: {
        select: {
          slug: true,
          nameAr: true,
          nameEn: true
        }
      }
    }
  });

  if (!dbService) {
    response.status(404).json({ success: false, message: "Service not found", error: "NOT_FOUND" });
    return;
  }

  const mappedService = {
    id: dbService.slug,
    slug: dbService.slug,
    name: { ar: dbService.nameAr, en: dbService.nameEn },
    category: {
      slug: dbService.category.slug,
      name: { ar: dbService.category.nameAr, en: dbService.category.nameEn }
    }
  };

  response.status(200).json(successResponse(mappedService, "Service fetched"));
}));

export const servicesRouter = router;
