import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const reqs = await prisma.customRequest.findMany();
  console.log("Custom Requests:");
  console.log(JSON.stringify(reqs, null, 2));

  // See if there are service requests
  const srv = await prisma.serviceRequest.findMany();
  console.log("Service Requests:");
  console.log(JSON.stringify(srv, null, 2));
}
main().finally(() => prisma.$disconnect());
