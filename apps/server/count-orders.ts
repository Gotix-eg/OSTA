import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.$transaction([
    prisma.serviceRequest.count(),
    prisma.directOrder.count(),
    prisma.materialOrder.count(),
    prisma.requestOffer.count(),
    prisma.payment.count(),
    prisma.review.count(),
    prisma.complaint.count(),
  ]);
  console.log(`serviceRequest: ${counts[0]}`);
  console.log(`directOrder: ${counts[1]}`);
  console.log(`materialOrder: ${counts[2]}`);
  console.log(`requestOffer: ${counts[3]}`);
  console.log(`payment: ${counts[4]}`);
  console.log(`review: ${counts[5]}`);
  console.log(`complaint: ${counts[6]}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
