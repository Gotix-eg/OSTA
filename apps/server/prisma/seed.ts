import "dotenv/config";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const CORE_CATEGORIES = [
  { nameAr: "نجارة", nameEn: "Carpentry", slug: "carpentry", icon: "hammer", imageUrl: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "سباكة", nameEn: "Plumbing", slug: "plumbing", icon: "droplets", imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1000&auto=format&fit=crop&v=osta5" },
  { nameAr: "كهرباء", nameEn: "Electricity", slug: "electricity", icon: "zap", imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "تكييف وتبريد", nameEn: "Air Conditioning", slug: "ac", icon: "wind", imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "صيانة أجهزة منزلية", nameEn: "Appliance Repair", slug: "appliances", icon: "settings", imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "دهانات وديكور", nameEn: "Painting", slug: "painting", icon: "paint-bucket", imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "ألوميتال", nameEn: "Aluminum Work", slug: "aluminum", icon: "layout", imageUrl: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "شبكات كمبيوتر", nameEn: "Computer Networks", slug: "networks", icon: "network", imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "صيانة كمبيوتر", nameEn: "Computer Repair", slug: "computer-repair", icon: "monitor", imageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1000&auto=format&fit=crop&v=osta4" },
  { nameAr: "تركيب كاميرات", nameEn: "Camera Installation", slug: "cctv", icon: "camera", imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "مبلط سيراميك", nameEn: "Ceramic Tiling", slug: "tiling", icon: "grid", imageUrl: "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "أعمال محارة", nameEn: "Plastering", slug: "plastering", icon: "layers", imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "حدادة", nameEn: "Ironwork", slug: "ironwork", icon: "hammer", imageUrl: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?q=80&w=1000&auto=format&fit=crop" },
  { nameAr: "تشطيبات شاملة", nameEn: "Comprehensive Finishing", slug: "finishing", icon: "layers", imageUrl: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=1000&auto=format&fit=crop" },
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
