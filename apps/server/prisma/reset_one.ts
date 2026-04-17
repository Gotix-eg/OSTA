import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Resetting one request to REPLIED for testing...");
  try {
    const first = await prisma.customRequest.findFirst({
       orderBy: { createdAt: "desc" }
    });
    if (first) {
       await prisma.customRequest.update({
         where: { id: first.id },
         data: { status: "REPLIED" }
       });
       console.log("Successfully reset request ID:", first.id);
    }
  } catch (e: any) {
    console.error("Error resetting request:", e.message);
  } finally {
    await prisma.$disconnect()
  }
}

main()
