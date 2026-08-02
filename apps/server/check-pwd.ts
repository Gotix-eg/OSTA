import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "./src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: "ADMIN" }
  });
  console.log(`Found ${users.length} admin users.`);
  for (const u of users) {
    const isMatch = await verifyPassword("Letmein@NZ", u.passwordHash);
    console.log(`User: ${u.firstName} ${u.lastName}, Phone: ${u.phone}, matches 'Letmein@NZ': ${isMatch}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
