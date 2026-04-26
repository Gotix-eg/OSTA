import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { phone: "01009410112" }
  });
  console.log("Admin User:", user ? { phone: user.phone, role: user.role, status: user.status } : "NOT FOUND");
}

main().catch(console.error).finally(() => prisma.$disconnect());
