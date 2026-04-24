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
  console.log("🧹 Starting Clean State Seed...");

  // 1. Wipe everything to ensure no mock data survives
  // Ordered to avoid foreign key constraints
  const tablenames = [
    "MaterialOffer", "MaterialRequest", "WalletTransaction", "Notification",
    "Message", "Review", "Warranty", "Complaint", "Invoice", "RequestStatusHistory",
    "RequestOffer", "ServiceRequest", "WorkerSpecialization", "WorkerArea",
    "WorkSchedule", "PortfolioItem", "WorkerBadge", "WorkerTool", "BankAccount",
    "FavoriteWorker", "Address", "OtpCode", "Session", "ClientProfile",
    "WorkerProfile", "VendorProfile", "User", "Service", "ServiceCategory",
    "SystemSetting"
  ];

  for (const tablename of tablenames) {
    try {
      await (prisma as any)[tablename.charAt(0).toLowerCase() + tablename.slice(1)].deleteMany();
    } catch (e) {
      // Some tables might not exist or be named differently in the schema proxy
    }
  }

  console.log("✅ Database Wiped.");

  // 2. Seed System Settings
  console.log("⚙️ Seeding System Settings...");
  await prisma.systemSetting.createMany({
    data: [
      { key: "platform_commission_rate", value: "15", type: "number" },
      { key: "worker_trial_days", value: "30", type: "number" },
      { key: "vendor_trial_days", value: "30", type: "number" },
      { key: "initial_order_quota", value: "10", type: "number" },
      { key: "min_withdrawal_amount", value: "500", type: "number" },
    ]
  });

  // 3. Seed Categories & Initial Services
  console.log("🏗️ Seeding Core Categories & Services...");
  for (const cat of CORE_CATEGORIES) {
    const category = await prisma.serviceCategory.create({
      data: {
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        isActive: true,
      }
    });

    // Create a default generic service for each category
    await prisma.service.create({
      data: {
        categoryId: category.id,
        nameAr: `خدمة ${cat.nameAr} شاملة`,
        nameEn: `General ${cat.nameEn} Service`,
        slug: `${cat.slug}-general`,
        isActive: true,
        warrantyDays: 30,
      }
    });
  }

  // 4. Seed Super Admin
  console.log("👤 Seeding Super Admin...");
  const adminPassword = await hashPassword("Letmein@OSTA2026");
  await prisma.user.create({
    data: {
      phone: "+201009410112",
      email: "admin@osta.eg",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "OSTA",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
    }
  });

  console.log("🚀 Seed Completed Successfully.");
  console.log("-----------------------------------");
  console.log("SUPER ADMIN ACCESS:");
  console.log("Phone: +201009410112");
  console.log("Pass: Letmein@OSTA2026");
  console.log("-----------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
