import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });
  
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { phone: "01009410112" }
    });
    console.log("Admin phone updated to exactly 01009410112");
  } else {
    console.log("Admin user not found");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
