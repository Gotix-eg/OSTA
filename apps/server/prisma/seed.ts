import "dotenv/config";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const CORE_CATEGORIES = [
  { nameAr: "نجارة", nameEn: "Carpentry", slug: "carpentry", icon: "hammer", imageUrl: "/images/services/carpentry.png" },
  { nameAr: "سباكة", nameEn: "Plumbing", slug: "plumbing", icon: "droplets", imageUrl: "/images/services/plumbing.png" },
  { nameAr: "كهرباء", nameEn: "Electricity", slug: "electricity", icon: "zap", imageUrl: "/images/services/electrical.png" },
  { nameAr: "تكييف وتبريد", nameEn: "Air Conditioning", slug: "ac", icon: "wind", imageUrl: "/images/services/ac.png" },
  { nameAr: "صيانة أجهزة منزلية", nameEn: "Appliance Repair", slug: "appliances", icon: "settings", imageUrl: "/images/services/appliances.png" },
  { nameAr: "دهانات وديكور", nameEn: "Painting", slug: "painting", icon: "paint-bucket", imageUrl: "/images/services/painting.png" },
  { nameAr: "ألوميتال", nameEn: "Aluminum Work", slug: "aluminum", icon: "layout", imageUrl: "/images/services/aluminum.png" },
  { nameAr: "شبكات كمبيوتر", nameEn: "Computer Networks", slug: "networks", icon: "network", imageUrl: "/images/services/networks.png" },
  { nameAr: "صيانة كمبيوتر", nameEn: "Computer Repair", slug: "computer-repair", icon: "monitor", imageUrl: "/images/services/computer.png" },
  { nameAr: "تركيب كاميرات", nameEn: "Camera Installation", slug: "cctv", icon: "cctv", imageUrl: "/images/services/cctv.png" },
  { nameAr: "مبلط سيراميك", nameEn: "Ceramic Tiling", slug: "tiling", icon: "grid", imageUrl: "/images/services/tiling.png" },
  { nameAr: "أعمال محارة", nameEn: "Plastering", slug: "plastering", icon: "layers", imageUrl: "/images/services/plastering.png" },
  { nameAr: "حدادة", nameEn: "Ironwork", slug: "ironwork", icon: "hammer", imageUrl: "/images/services/ironwork.png" },
  { nameAr: "تشطيبات شاملة", nameEn: "Comprehensive Finishing", slug: "finishing", icon: "layers", imageUrl: "/images/services/finishing.png" },
  { nameAr: "جبس بورد وديكور", nameEn: "Gypsum Board", slug: "gypsum", icon: "layout", imageUrl: "/images/services/gypsum.png" },
  { nameAr: "نقل عفش وتغليف", nameEn: "Furniture Moving", slug: "moving", icon: "truck", imageUrl: "/images/services/moving.png" },
  { nameAr: "تنظيف وتعقيم منازل", nameEn: "Home Cleaning", slug: "cleaning", icon: "sparkles", imageUrl: "/images/services/cleaning.png" },
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
        imageUrl: cat.imageUrl,
      },
      create: {
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        imageUrl: cat.imageUrl,
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

  // 3. Optional admin seed. Never use a hard-coded production password.
  const adminPhone = process.env.SEED_ADMIN_PHONE;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@osta.eg";

  if (adminPhone && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);

    await prisma.user.upsert({
      where: { phone: adminPhone },
      update: {
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      create: {
        phone: adminPhone,
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "OSTA",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
      }
    });
  } else {
    console.log("Skipping admin seed. Set SEED_ADMIN_PHONE and SEED_ADMIN_PASSWORD to create/update an admin.");
  }

  console.log("🚀 Local Seed Completed Successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
