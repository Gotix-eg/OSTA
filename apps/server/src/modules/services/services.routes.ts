import { Router } from "express";
import { serviceCategories } from "../../data/services.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();


router.get("/categories", catchAsync(async (_request, response) => {
  let categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
  });

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

    let i = 0;
    for (const cat of serviceCategories) {
      const slug = cat.slug;
      const category = await prisma.serviceCategory.upsert({
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

      let j = 0;
      for (const srv of cat.services) {
        await prisma.service.upsert({
          where: { slug: srv.slug },
          update: {},
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

    categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
    });
  }

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
