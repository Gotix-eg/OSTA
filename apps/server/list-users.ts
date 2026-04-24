import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`  Name: ${u.firstName} ${u.lastName}`);
    console.log(`  Phone: ${u.phone}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  Status: ${u.status}`);
    console.log(`  CreatedAt: ${u.createdAt}`);
    console.log();
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
