import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔁 FINAL CLEANUP — Preserve ONLY admin accounts\n");

  // ── 1. Backup admin before deletion ───────────────────────────────────────
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: {
      id: true, email: true, phone: true, passwordHash: true,
      role: true, status: true, firstName: true, lastName: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (admins.length === 0) {
    console.log("❌ No admin accounts found. Aborting.");
    process.exit(1);
  }

  console.log(`✅ Found ${admins.length} admin(s):`);
  admins.forEach(a => console.log(`   • ${a.firstName} ${a.lastName} (${a.phone}) — ${a.role}`));

  // ── 2. Wipe EVERYTHING else (including non-admin users) ──────────────────
  console.log("\n⚠️  Wiping all non-admin data...\n");

  const counts: Record<string, number> = {};

  // Delete non-admin users first (cascades to profiles, addresses, etc.)
  counts["nonAdminUsers"] = (await prisma.user.deleteMany({
    where: { role: { notIn: ["ADMIN", "SUPER_ADMIN"] } }
  })).count;

  // Then wipe remaining system/operational tables
  counts.requestStatusHistory = (await prisma.requestStatusHistory.deleteMany()).count;
  counts.requestOffer = (await prisma.requestOffer.deleteMany()).count;
  counts.invoice = (await prisma.invoice.deleteMany()).count;
  counts.warranty = (await prisma.warranty.deleteMany()).count;
  counts.complaint = (await prisma.complaint.deleteMany()).count;
  counts.review = (await prisma.review.deleteMany()).count;
  counts.payment = (await prisma.payment.deleteMany()).count;
  counts.serviceRequest = (await prisma.serviceRequest.deleteMany()).count;
  
  counts.directOrderItem = (await prisma.directOrderItem.deleteMany()).count;
  counts.directOrder = (await prisma.directOrder.deleteMany()).count;
  counts.customRequest = (await prisma.customRequest.deleteMany()).count;
  counts.vendorProduct = (await prisma.vendorProduct.deleteMany()).count;

  counts.materialOrder = (await prisma.materialOrder.deleteMany()).count;
  counts.materialOffer = (await prisma.materialOffer.deleteMany()).count;
  counts.materialRequest = (await prisma.materialRequest.deleteMany()).count;

  counts.workerSpecialization = (await prisma.workerSpecialization.deleteMany()).count;
  counts.workerArea = (await prisma.workerArea.deleteMany()).count;
  counts.workSchedule = (await prisma.workSchedule.deleteMany()).count;
  counts.portfolioItem = (await prisma.portfolioItem.deleteMany()).count;
  counts.workerBadge = (await prisma.workerBadge.deleteMany()).count;
  counts.workerTool = (await prisma.workerTool.deleteMany()).count;
  counts.bankAccount = (await prisma.bankAccount.deleteMany()).count;
  counts.favoriteWorker = (await prisma.favoriteWorker.deleteMany()).count;

  counts.notification = (await prisma.notification.deleteMany()).count;
  counts.message = (await prisma.message.deleteMany()).count;
  counts.walletTransaction = (await prisma.walletTransaction.deleteMany()).count;
  counts.adCampaign = (await prisma.adCampaign.deleteMany()).count;

  counts.session = (await prisma.session.deleteMany()).count;
  counts.otpCode = (await prisma.otpCode.deleteMany()).count;

  counts.address = (await prisma.address.deleteMany()).count;

  counts.promotion = (await prisma.promotion.deleteMany()).count;
  counts.area = (await prisma.area.deleteMany()).count;
  counts.systemSetting = (await prisma.systemSetting.deleteMany()).count;
  counts.auditLog = (await prisma.auditLog.deleteMany()).count;

  // ── 3. Summary ─────────────────────────────────────────────────────────────
  console.log("✅ Cleanup complete. Deleted rows:");
  for (const [table, count] of Object.entries(counts)) {
    if (count > 0) console.log(`   ${table}: ${count}`);
  }

  // ── 4. Verify only admins remain ──────────────────────────────────────────
  const remainingUsers = await prisma.user.count();
  const remainingNonAdmins = await prisma.user.count({
    where: { role: { notIn: ["ADMIN", "SUPER_ADMIN"] } }
  });

  console.log(`\n🎯 Verification:`);
  console.log(`   Total users remaining: ${remainingUsers}`);
  console.log(`   Non-admin users remaining: ${remainingNonAdmins}`);

  if (remainingNonAdmins === 0 && remainingUsers === admins.length) {
    console.log(`\n✅ SUCCESS: Only ${admins.length} admin account(s) remain.`);
    console.log("\n💡 Admin credentials:");
    admins.forEach(a => {
      console.log(`   • ${a.firstName} ${a.lastName}`);
      console.log(`     Phone: ${a.phone}`);
      console.log(`     Email: ${a.email || 'N/A'}`);
    });
  } else {
    console.log("\n❌ ERROR: Some non-admin users still exist!");
  }
}

main()
  .catch(e => console.error("❌ Failed:", e))
  .finally(() => prisma.$disconnect());
