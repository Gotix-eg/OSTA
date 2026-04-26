import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Letmein@NZ");
  await prisma.user.updateMany({
    where: { 
      OR: [
        { phone: "01009410112" },
        { phone: "+201009410112" },
        { email: "admin@osta.eg" }
      ] 
    },
    data: { 
      phone: "01009410112",
      email: "admin@osta.eg",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });
  console.log("Admin user forcefully updated to 01009410112 / Letmein@NZ");
}

main().catch(console.error).finally(() => prisma.$disconnect());
