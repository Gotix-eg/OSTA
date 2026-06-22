import { PrismaClient } from "@prisma/client";
import { randomInt } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to fix request numbers...");
  const requests = await prisma.serviceRequest.findMany();
  console.log(`Found ${requests.length} requests in total.`);

  let fixedCount = 0;
  for (const req of requests) {
    const isOnlyDigits = /^\d{8}$/.test(req.requestNumber);
    if (!isOnlyDigits) {
      // Generate unique 8-digit number
      let requestNumber = "";
      while (true) {
        const candidate = String(randomInt(10000000, 100000000));
        const existing = await prisma.serviceRequest.findUnique({
          where: { requestNumber: candidate },
        });
        if (!existing) {
          requestNumber = candidate;
          break;
        }
      }

      await prisma.serviceRequest.update({
        where: { id: req.id },
        data: { requestNumber },
      });
      console.log(`Updated request ID ${req.id} from "${req.requestNumber}" to "${requestNumber}"`);
      fixedCount++;
    }
  }

  console.log(`Completed fixing request numbers. Updated ${fixedCount} requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
