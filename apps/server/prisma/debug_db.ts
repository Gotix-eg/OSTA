import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Listing CustomRequests and their statuses...");
  try {
    const list = await prisma.customRequest.findMany({
      include: { vendor: { select: { shopName: true } } }
    });
    console.log("Requests:", JSON.stringify(list, null, 2));
  } catch (e: any) {
    console.error("Error checking schema:", e.message);
  } finally {
    await prisma.$disconnect()
  }
}

main()
