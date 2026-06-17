import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const areas = await prisma.area.findMany();
  console.log("=== AREAS IN DATABASE ===");
  console.log(JSON.stringify(areas, null, 2));

  const workerAreas = await prisma.workerArea.findMany();
  console.log("=== WORKER AREAS IN DATABASE ===");
  console.log(JSON.stringify(workerAreas, null, 2));

  const categories = await prisma.serviceCategory.findMany({
    include: {
      services: true
    }
  });
  console.log("=== CATEGORIES & SERVICES IN DATABASE ===");
  console.log(JSON.stringify(categories.map(c => ({
    id: c.id,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    slug: c.slug,
    services: c.services.map(s => ({ id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, slug: s.slug }))
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
