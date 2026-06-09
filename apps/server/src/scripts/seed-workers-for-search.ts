import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Areas...");
  const areasToCreate = [
    { governorate: "cairo", city: "new-cairo", area: "5th-settlement" },
    { governorate: "cairo", city: "new-cairo", area: "1st-settlement" },
    { governorate: "cairo", city: "new-cairo", area: "rehab" },
    { governorate: "cairo", city: "new-cairo", area: "madinaty" },
    { governorate: "cairo", city: "nasr-city", area: "1st-district" },
    { governorate: "cairo", city: "nasr-city", area: "8th-district" },
    { governorate: "cairo", city: "maadi", area: "sarayat-maadi" },
    { governorate: "cairo", city: "maadi", area: "hadayek-maadi" },
    { governorate: "giza", city: "6th-october", area: "1st-district" },
    { governorate: "giza", city: "sheikh-zayed", area: "green-belt" },
  ];

  for (const a of areasToCreate) {
    await prisma.area.upsert({
      where: {
        governorate_city_area: {
          governorate: a.governorate,
          city: a.city,
          area: a.area
        }
      },
      update: { isActive: true },
      create: {
        governorate: a.governorate,
        city: a.city,
        area: a.area,
        isActive: true
      }
    });
  }

  // Find category and services IDs
  const electricityService = await prisma.service.findFirst({ where: { category: { slug: "electricity" } } });
  const plumbingService = await prisma.service.findFirst({ where: { category: { slug: "plumbing" } } });
  const carpentryService = await prisma.service.findFirst({ where: { category: { slug: "carpentry" } } });
  const acService = await prisma.service.findFirst({ where: { category: { slug: "ac" } } });

  console.log("Specialties to seed:");
  console.log("Electricity Service:", electricityService?.id);
  console.log("Plumbing Service:", plumbingService?.id);
  console.log("Carpentry Service:", carpentryService?.id);
  console.log("AC Service:", acService?.id);

  const worker1Id = "cmp5drygt000avafcl5hx9pzp"; // محمد الفني
  const worker2Id = "cmq15sv1m0001l204laby4so2"; // ahmed mohamed
  const worker3Id = "cmq15s4960001ju04xd93u13a"; // Test Worker
  const worker4Id = "cmq5mzdyp0009k404xjxrcisl"; // gamal Ahmed

  // Clear existing specializations/areas
  await prisma.workerSpecialization.deleteMany({
    where: { workerId: { in: [worker1Id, worker2Id, worker3Id, worker4Id] } }
  });
  await prisma.workerArea.deleteMany({
    where: { workerId: { in: [worker1Id, worker2Id, worker3Id, worker4Id] } }
  });

  // Seed Worker 1 (محمد الفني) - Featured Electrician
  await prisma.workerProfile.update({
    where: { id: worker1Id },
    data: {
      verificationStatus: "VERIFIED",
      subscriptionTier: "featured",
      rating: 4.8,
      ratingCount: 12,
      totalJobsCompleted: 42,
      isOnline: true,
      isAvailable: true,
      specializations: {
        create: {
          serviceId: electricityService!.id
        }
      },
      workAreas: {
        create: {
          governorate: "cairo",
          city: "new-cairo",
          area: "5th-settlement"
        }
      }
    }
  });

  // Seed Worker 2 (ahmed mohamed) - Plumber in Rehab
  await prisma.workerProfile.update({
    where: { id: worker2Id },
    data: {
      verificationStatus: "VERIFIED",
      subscriptionTier: "free",
      rating: 4.5,
      ratingCount: 8,
      totalJobsCompleted: 19,
      isOnline: false,
      isAvailable: true,
      specializations: {
        create: {
          serviceId: plumbingService!.id
        }
      },
      workAreas: {
        create: {
          governorate: "cairo",
          city: "new-cairo",
          area: "rehab"
        }
      }
    }
  });

  // Seed Worker 3 (Test Worker) - Carpenter in Nasr City
  await prisma.workerProfile.update({
    where: { id: worker3Id },
    data: {
      verificationStatus: "VERIFIED",
      subscriptionTier: "free",
      rating: 4.9,
      ratingCount: 25,
      totalJobsCompleted: 88,
      isOnline: true,
      isAvailable: true,
      specializations: {
        create: {
          serviceId: carpentryService!.id
        }
      },
      workAreas: {
        create: {
          governorate: "cairo",
          city: "nasr-city",
          area: "1st-district"
        }
      }
    }
  });

  // Seed Worker 4 (gamal Ahmed) - AC Tech in Fifth Settlement
  await prisma.workerProfile.update({
    where: { id: worker4Id },
    data: {
      verificationStatus: "VERIFIED",
      subscriptionTier: "free",
      rating: 4.2,
      ratingCount: 5,
      totalJobsCompleted: 10,
      isOnline: true,
      isAvailable: true,
      specializations: {
        create: {
          serviceId: acService!.id
        }
      },
      workAreas: {
        create: {
          governorate: "cairo",
          city: "new-cairo",
          area: "5th-settlement"
        }
      }
    }
  });

  console.log("🎉 Seeding workers completed!");
}

main().finally(() => prisma.$disconnect());
