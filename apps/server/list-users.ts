import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, role: true }
  });
  console.log("Users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
