import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Wiping ALL data from the database...\n");

  const counts: Record<string, number> = {};

  // 1. Deepest leaf tables first
  counts.requestStatusHistory = (await prisma.requestStatusHistory.deleteMany()).count;
  counts.requestOffer = (await prisma.requestOffer.deleteMany()).count;
  counts.invoice = (await prisma.invoice.deleteMany()).count;
  counts.warranty = (await prisma.warranty.deleteMany()).count;
  counts.complaint = (await prisma.complaint.deleteMany()).count;
  counts.review = (await prisma.review.deleteMany()).count;
  counts.payment = (await prisma.payment.deleteMany()).count;
  counts.serviceRequest = (await prisma.serviceRequest.deleteMany()).count;

  // 2. Vendor sub-tables
  counts.directOrderItem = (await prisma.directOrderItem.deleteMany()).count;
  counts.directOrder = (await prisma.directOrder.deleteMany()).count;
  counts.customRequest = (await prisma.customRequest.deleteMany()).count;
  counts.vendorProduct = (await prisma.vendorProduct.deleteMany()).count;

  // 3. Material request system
  counts.materialOrder = (await prisma.materialOrder.deleteMany()).count;
  counts.materialOffer = (await prisma.materialOffer.deleteMany()).count;
  counts.materialRequest = (await prisma.materialRequest.deleteMany()).count;

  // 4. Worker sub-tables
  counts.workerSpecialization = (await prisma.workerSpecialization.deleteMany()).count;
  counts.workerArea = (await prisma.workerArea.deleteMany()).count;
  counts.workSchedule = (await prisma.workSchedule.deleteMany()).count;
  counts.portfolioItem = (await prisma.portfolioItem.deleteMany()).count;
  counts.workerBadge = (await prisma.workerBadge.deleteMany()).count;
  counts.workerTool = (await prisma.workerTool.deleteMany()).count;
  counts.bankAccount = (await prisma.bankAccount.deleteMany()).count;
  counts.favoriteWorker = (await prisma.favoriteWorker.deleteMany()).count;

  // 5. Misc tables
  counts.notification = (await prisma.notification.deleteMany()).count;
  counts.message = (await prisma.message.deleteMany()).count;
  counts.walletTransaction = (await prisma.walletTransaction.deleteMany()).count;
  counts.adCampaign = (await prisma.adCampaign.deleteMany()).count;

  // 6. Sessions & OTP
  counts.session = (await prisma.session.deleteMany()).count;
  counts.otpCode = (await prisma.otpCode.deleteMany()).count;

  // 7. Profiles (before User)
  counts.clientProfile = (await prisma.clientProfile.deleteMany()).count;
  counts.workerProfile = (await prisma.workerProfile.deleteMany()).count;
  counts.vendorProfile = (await prisma.vendorProfile.deleteMany()).count;

  // 8. Addresses
  counts.address = (await prisma.address.deleteMany()).count;

  // 9. User (last, everything cascades from here)
  counts.user = (await prisma.user.deleteMany()).count;

  // 10. System tables
  counts.promotion = (await prisma.promotion.deleteMany()).count;
  counts.area = (await prisma.area.deleteMany()).count;
  counts.systemSetting = (await prisma.systemSetting.deleteMany()).count;
  counts.auditLog = (await prisma.auditLog.deleteMany()).count;

  console.log("✅ Database wiped! Deleted rows per table:");
  for (const [table, count] of Object.entries(counts)) {
    if (count > 0) console.log(`   ${table}: ${count}`);
  }
  console.log("\n🎉 Done. You can now register fresh accounts.");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
