import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking current non-admin users...\n");
  
  const nonAdmins = await prisma.user.findMany({
    where: { role: { notIn: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, phone: true, role: true, firstName: true, lastName: true }
  });
  
  if (nonAdmins.length === 0) {
    console.log("✅ No non-admin users found. Database is clean.");
    process.exit(0);
  }
  
  console.log(`Deleting ${nonAdmins.length} non-admin user(s):\n`);
  nonAdmins.forEach(u => console.log(`  - ${u.firstName} ${u.lastName} (${u.role}) — ${u.phone}`));
  
  const result = await prisma.user.deleteMany({
    where: { role: { notIn: ["ADMIN", "SUPER_ADMIN"] } }
  });
  
  console.log(`\n✅ Deleted ${result.count} user(s) and all their related data (cascade).`);
  console.log("   All orders, requests, messages, transactions, profiles cleared.");
  console.log("\n🎯 Remaining: Admin account only.");
}

main()
  .catch(e => console.error("❌ Error:", e))
  .finally(() => prisma.$disconnect());
