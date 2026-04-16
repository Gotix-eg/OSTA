import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.directOrder.findMany({
    include: {
      items: { include: { product: true } },
      vendor: { select: { shopName: true } }
    }
  });
  console.log(JSON.stringify(orders, null, 2));
}
main().finally(() => prisma.$disconnect());
