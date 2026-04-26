import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Letmein@NZ");
  await prisma.user.update({
    where: { id: "cmodagbq9000zkn6k91x6y4pg" },
    data: { 
      phone: "01009410112",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });
  console.log("Admin user successfully fixed by ID to 01009410112 / Letmein@NZ");
}

main().catch(console.error).finally(() => prisma.$disconnect());
