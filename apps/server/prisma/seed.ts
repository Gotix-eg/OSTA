import "dotenv/config";

import { PrismaClient, UserRole } from "@prisma/client";

import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function upsertClient() {
  const passwordHash = await hashPassword("Password123!");

  return prisma.user.upsert({
    where: { phone: "+201000000000" },
    update: {
      firstName: "Mariam",
      lastName: "Hassan",
      email: "mariam@osta.eg",
      passwordHash,
      role: UserRole.CLIENT
    },
    create: {
      firstName: "Mariam",
      lastName: "Hassan",
      email: "mariam@osta.eg",
      phone: "+201000000000",
      passwordHash,
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          totalRequests: 28,
          walletBalance: 860,
          isVip: true
        }
      }
    }
  });
}

async function upsertWorker() {
  const passwordHash = await hashPassword("Password123!");

  return prisma.user.upsert({
    where: { phone: "+201055555555" },
    update: {
      firstName: "Youssef",
      lastName: "Mahmoud",
      email: "youssef.worker@osta.eg",
      passwordHash,
      role: UserRole.WORKER
    },
    create: {
      firstName: "Youssef",
      lastName: "Mahmoud",
      email: "youssef.worker@osta.eg",
      phone: "+201055555555",
      passwordHash,
      role: UserRole.WORKER,
      workerProfile: {
        create: {
          yearsOfExperience: 8,
          rating: 4.9,
          ratingCount: 312,
          isAvailable: true,
          isOnline: true,
          totalJobsCompleted: 354,
          totalEarnings: 11240
        }
      }
    }
  });
}

async function upsertAdmin() {
  const passwordHash = await hashPassword("Letmein@NZ");

  return prisma.user.upsert({
    where: { phone: "+201009410112" },
    update: {
      firstName: "Admin",
      lastName: "OSTA",
      email: "admin@osta.eg",
      passwordHash,
      role: UserRole.ADMIN
    },
    create: {
      firstName: "Admin",
      lastName: "OSTA",
      email: "admin@osta.eg",
      phone: "+201009410112",
      passwordHash,
      role: UserRole.ADMIN
    }
  });
}

async function main() {
  const client = await upsertClient();
  const worker = await upsertWorker();
  const admin = await upsertAdmin();

  console.log("Seeded users:");
  console.log(`CLIENT ${client.phone} Password123!`);
  console.log(`WORKER ${worker.phone} Password123!`);
  console.log(`ADMIN ${admin.phone} Letmein@NZ`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
