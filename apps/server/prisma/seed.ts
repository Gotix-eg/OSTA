import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, WorkerVerificationStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const CORE_CATEGORIES = [
  { nameAr: "نجارة", nameEn: "Carpentry", slug: "carpentry", icon: "hammer" },
  { nameAr: "سباكة", nameEn: "Plumbing", slug: "plumbing", icon: "droplets" },
  { nameAr: "كهرباء", nameEn: "Electricity", slug: "electricity", icon: "zap" },
  { nameAr: "تكييف وتبريد", nameEn: "Air Conditioning", slug: "ac", icon: "wind" },
  { nameAr: "صيانة أجهزة منزلية", nameEn: "Appliance Repair", slug: "appliances", icon: "settings" },
  { nameAr: "دهانات وديكور", nameEn: "Painting", slug: "painting", icon: "paint-bucket" },
  { nameAr: "ألوميتال", nameEn: "Aluminum Work", slug: "aluminum", icon: "layout" },
  { nameAr: "شبكات كمبيوتر", nameEn: "Computer Networks", slug: "networks", icon: "network" },
  { nameAr: "صيانة كمبيوتر", nameEn: "Computer Repair", slug: "computer-repair", icon: "monitor" },
  { nameAr: "تركيب كاميرات", nameEn: "Camera Installation", slug: "cctv", icon: "camera" },
];

async function main() {
  console.log("🔄 Starting Local Seed Sync...");

  // 1. Seed System Settings
  const settings = [
    { key: "platform_commission_rate", value: "15", type: "number" },
    { key: "worker_trial_days", value: "30", type: "number" },
    { key: "vendor_trial_days", value: "30", type: "number" },
    { key: "initial_order_quota", value: "10", type: "number" },
    { key: "min_withdrawal_amount", value: "500", type: "number" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // 2. Seed Categories
  for (const cat of CORE_CATEGORIES) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        icon: cat.icon,
      },
      create: {
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        isActive: true,
      }
    });

    const serviceSlug = `${cat.slug}-general`;
    await prisma.service.upsert({
      where: { slug: serviceSlug },
      update: {},
      create: {
        categoryId: category.id,
        nameAr: `خدمة ${cat.nameAr} شاملة`,
        nameEn: `General ${cat.nameEn} Service`,
        slug: serviceSlug,
        isActive: true,
        warrantyDays: 30,
      }
    });
  }

  // 3. Admin
  const adminPhone = "01009410112";
  const passwordHash = await hashPassword("Letmein@NZ");
  
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      phone: adminPhone,
      email: "admin@osta.eg",
      passwordHash,
      firstName: "Admin",
      lastName: "OSTA",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
    }
  });

  console.log("🚀 Local Seed Completed Successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
