import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("   تحقق من بيانات المستخدم والدفع");
  console.log("═══════════════════════════════════════════════\n");

  // Check ALL users
  const users = await prisma.user.findMany();
  console.log(`👥 جميع المستخدمين في قاعدة البيانات: ${users.length}\n`);
  users.forEach(u => {
    console.log(`   الاسم: ${u.firstName} ${u.lastName}`);
    console.log(`   الهاتف: ${u.phone} | الدور: ${u.role}`);
    console.log(`   البريد: ${u.email || 'غير محدد'}`);
    console.log(`   الحالة: ${u.status}`);
    console.log(`   createdAt: ${u.createdAt.toISOString()}`);
    console.log();
  });

  // Check profiles linked to users
  const clients = await prisma.clientProfile.findMany({ include: { user: true } });
  const workers = await prisma.workerProfile.findMany({ include: { user: true } });
  const vendors = await prisma.vendorProfile.findMany({ include: { user: true } });

  console.log(`📋 الملفات الشخصية:`);
  console.log(`   عملاء: ${clients.length}`);
  clients.forEach(c => console.log(`      - ${c.user.firstName} ${c.user.lastName} (الهاتف: ${c.user.phone}, الرصيد: ${c.walletBalance} EGP)`));
  console.log(`   عمال: ${workers.length}`);
  workers.forEach(w => console.log(`      - ${w.user.firstName} ${w.user.lastName} (الهاتف: ${w.user.phone}, التقييم: ${w.rating})`));
  console.log(`   بائعين: ${vendors.length}`);
  vendors.forEach(v => console.log(`      - ${v.user.firstName} ${v.user.lastName} (الهاتف: ${v.user.phone}, المحل: ${v.shopName})`));
  console.log();

  // Check wallet transactions
  const tx = await prisma.walletTransaction.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  console.log(`💰 المعاملات المالية (آخر 10): ${(await prisma.walletTransaction.count())} إجمالي\n`);
  tx.forEach(t => {
    console.log(`   النوع: ${t.type} | المبلغ: ${t.amount} EGP | الرصيد: ${t.balance} EGP`);
    console.log(`   الوصف: ${t.description || 'لا يوجد'}`);
    console.log(`   التاريخ: ${t.createdAt.toISOString()}`);
    console.log();
  });

  // Check address
  const addresses = await prisma.address.findMany();
  console.log(`📍 العناوين: ${addresses.length}\n`);
  addresses.forEach(a => {
    console.log(`   المستخدم: ${a.userId}`);
    console.log(`   العنوان: ${a.label} — ${a.street}, ${a.area}, ${a.city}, ${a.governorate}`);
    console.log();
  });

  // Check service requests
  const reqs = await prisma.serviceRequest.findMany({ take: 5, orderBy: { createdAt: "desc" } });
  console.log(`🔧 طلبات الخدمة: ${(await prisma.serviceRequest.count())} إجمالي (آخر 5)\n`);
  reqs.forEach(r => console.log(`   #${r.requestNumber} — ${r.title} — الحالة: ${r.status}`));
  console.log();
}

main()
  .catch(e => console.error("❌ خطأ:", e))
  .finally(() => prisma.$disconnect());
