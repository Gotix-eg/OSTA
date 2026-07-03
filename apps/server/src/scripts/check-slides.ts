import { prisma } from "../lib/prisma.js";

async function main() {
  const settings = await prisma.systemSetting.findMany();
  console.log("=== DATABASE SYSTEM SETTINGS ===");
  console.log(JSON.stringify(settings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
