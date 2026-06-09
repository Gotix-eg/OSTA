import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workers = await prisma.workerProfile.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      workAreas: true,
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

  console.log("=== WORKERS IN DATABASE ===");
  console.log(JSON.stringify(workers.map(w => ({
    id: w.id,
    name: `${w.user.firstName} ${w.user.lastName}`,
    subscriptionTier: w.subscriptionTier,
    rating: w.rating,
    totalJobs: w.totalJobsCompleted,
    areas: w.workAreas.map(wa => ({ governorate: wa.governorate, city: wa.city, area: wa.area })),
    specialties: w.specializations.map(s => s.service.category.slug)
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
