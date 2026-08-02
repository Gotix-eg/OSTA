import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Letmein@NZ");
  
  // Update System Admin (with the typo +2001009410112 or correct +201009410112)
  const systemAdmin = await prisma.user.findFirst({
    where: { phone: "+2001009410112" }
  });
  
  if (systemAdmin) {
    await prisma.user.update({
      where: { id: systemAdmin.id },
      data: {
        phone: "+201009410112", // Fix the typo in the phone number
        passwordHash: passwordHash
      }
    });
    console.log("Updated System Admin phone to +201009410112 and password to Letmein@NZ");
  }

  // Update Admin OSTA (01009410112)
  const adminOsta = await prisma.user.findFirst({
    where: { phone: "01009410112" }
  });

  if (adminOsta) {
    await prisma.user.update({
      where: { id: adminOsta.id },
      data: {
        passwordHash: passwordHash
      }
    });
    console.log("Updated Admin OSTA (01009410112) password to Letmein@NZ");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
