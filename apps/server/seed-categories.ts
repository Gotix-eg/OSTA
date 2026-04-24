import { PrismaClient } from "@prisma/client";
import { serviceCategories } from "./src/data/services.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 10 core categories...");

  for (const cat of serviceCategories) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        nameAr: cat.name.ar,
        nameEn: cat.name.en,
        icon: cat.icon,
      },
      create: {
        nameAr: cat.name.ar,
        nameEn: cat.name.en,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    console.log(`- Category: ${category.nameEn}`);

    for (const srv of cat.services) {
      await prisma.service.upsert({
        where: { slug: srv.slug },
        update: {
          nameAr: srv.name.ar,
          nameEn: srv.name.en,
        },
        create: {
          categoryId: category.id,
          nameAr: srv.name.ar,
          nameEn: srv.name.en,
          slug: srv.slug,
        },
      });
      console.log(`  - Service: ${srv.name.en}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
