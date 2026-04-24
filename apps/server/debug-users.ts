import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check all users with details
  const users = await prisma.user.findMany({
    select: {
      id: true, phone: true, role: true, firstName: true, lastName: true,
      createdAt: true, updatedAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  
  console.log(`📱 All users in database: ${users.length}\n`);
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`  Phone: ${u.phone} | Role: ${u.role}`);
    console.log(`  Name: ${u.firstName} ${u.lastName}`);
    console.log(`  Created: ${u.createdAt.toISOString()}`);
    console.log(`  Updated: ${u.updatedAt.toISOString()}`);
    console.log();
  });

  // Check query logs? Look for any audit entries
  const audit = await prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  if (audit.length > 0) {
    console.log("\n📜 Recent audit log entries:\n");
    audit.forEach(a => console.log(`  ${a.createdAt}: ${a.action} on ${a.entity} by ${a.userId || 'system'}`));
  } else {
    console.log("\n📜 No audit log entries found.\n");
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
