import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const totalUsers = await prisma.user.count();
  const byRole = await prisma.user.groupBy({ by: ['role'], _count: { id: true } });
  console.log(`Total users: ${totalUsers}`);
  console.log("Users by role:", byRole);

  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } });
  console.log(`Admin users found: ${admins.length}`);
  admins.forEach(a => console.log(` - ${a.firstName} ${a.lastName}, phone: ${a.phone}, role: ${a.role}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
