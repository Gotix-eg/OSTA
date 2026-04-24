import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deep cleaning OSTA Database...");

  // Delete everything related to operations
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.directOrderItem.deleteMany();
  await prisma.directOrder.deleteMany();
  await prisma.customRequest.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.requestOffer.deleteMany();
  await prisma.workerSpecialization.deleteMany();
  await prisma.workerArea.deleteMany();
  await prisma.workerBadge.deleteMany();
  await prisma.workerTool.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.favoriteWorker.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vendorProduct.deleteMany();

  // Profiles
  await prisma.workerProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.clientProfile.deleteMany();

  // Users
  await prisma.user.deleteMany({
    where: {
      role: { not: "ADMIN" } // Keep admins if they exist, or delete all? 
    }
  });

  console.log("Cleanup complete! Database is now empty of mock/test data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
