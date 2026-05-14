import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  console.log("Seeding dashboard data...");

  const passwordHash = await hashPassword("Password123");

  // 1. Categories & Services
  const category = await prisma.serviceCategory.upsert({
    where: { slug: "electricity" },
    update: {},
    create: {
      nameAr: "كهرباء",
      nameEn: "Electricity",
      slug: "electricity",
      icon: "zap"
    }
  });

  const service = await prisma.service.upsert({
    where: { slug: "fix-socket" },
    update: {},
    create: {
      categoryId: category.id,
      nameAr: "إصلاح بريزة",
      nameEn: "Fix Socket",
      slug: "fix-socket",
      basePriceMin: 50,
      basePriceMax: 150
    }
  });

  // 2. Client
  const clientUser = await prisma.user.upsert({
    where: { phone: "01111111111" },
    update: {},
    create: {
      phone: "01111111111",
      firstName: "أحمد",
      lastName: "العميل",
      passwordHash,
      role: "CLIENT"
    }
  });

  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: { walletBalance: 500 },
    create: {
      userId: clientUser.id,
      walletBalance: 500
    }
  });

  const address = await prisma.address.create({
    data: {
      userId: clientUser.id,
      label: "البيت",
      governorate: "القاهرة",
      city: "التجمع",
      area: "التجمع الخامس",
      street: "شارع التسعين",
      isDefault: true
    }
  });

  // 3. Worker
  const workerUser = await prisma.user.upsert({
    where: { phone: "02222222222" },
    update: {},
    create: {
      phone: "02222222222",
      firstName: "محمد",
      lastName: "الفني",
      passwordHash,
      role: "WORKER"
    }
  });

  const workerProfile = await prisma.workerProfile.upsert({
    where: { userId: workerUser.id },
    update: { 
      verificationStatus: "VERIFIED",
      orderQuota: 50,
      rating: 4.8,
      ratingCount: 12
    },
    create: {
      userId: workerUser.id,
      verificationStatus: "VERIFIED",
      orderQuota: 50,
      rating: 4.8,
      ratingCount: 12,
      subscriptionTier: "pro"
    }
  });

  // 4. Vendor
  const vendorUser = await prisma.user.upsert({
    where: { phone: "03333333333" },
    update: {},
    create: {
      phone: "03333333333",
      firstName: "محمود",
      lastName: "المورد",
      passwordHash,
      role: "VENDOR"
    }
  });

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {
      shopName: "أضواء القاهرة",
      shopNameAr: "أضواء القاهرة للكهرباء",
      verificationStatus: "VERIFIED",
      walletBalance: 1200
    },
    create: {
      userId: vendorUser.id,
      shopName: "أضواء القاهرة",
      shopNameAr: "أضواء القاهرة للكهرباء",
      verificationStatus: "VERIFIED",
      walletBalance: 1200,
      governorate: "القاهرة",
      city: "النزهة"
    }
  });

  // 5. Data - Service Requests
  await prisma.serviceRequest.createMany({
    data: [
      {
        clientId: clientProfile.id,
        serviceId: service.id,
        addressId: address.id,
        title: "مشكلة في لوحة الكهرباء",
        description: "الكهرباء بتقطع كل شوية في الصالة",
        status: "PENDING",
        urgency: "URGENT"
      }
    ]
  });

  // For the active one, we need to link IDs so we create individually
  await prisma.serviceRequest.create({
    data: {
      clientId: clientProfile.id,
      workerId: workerProfile.id,
      serviceId: service.id,
      addressId: address.id,
      title: "تركيب نجفة",
      description: "عايز أركب نجفة كبيرة في الريسبشن",
      status: "IN_PROGRESS",
      urgency: "NORMAL",
      startedAt: new Date()
    }
  });

  // 6. Data - Direct Orders (Vendor)
  await prisma.directOrder.create({
    data: {
      clientId: clientUser.id,
      vendorId: vendorProfile.id,
      totalAmount: 450,
      status: "PENDING",
      deliveryNotes: "يرجى التوصيل قبل الساعة ٥",
      items: {
        create: [
          {
            product: {
              create: {
                vendorId: vendorProfile.id,
                nameAr: "سلك كهرباء ٢ ملم",
                nameEn: "2mm Electric Wire",
                price: 150
              }
            },
            qty: 3,
            unitPrice: 150
          }
        ]
      }
    }
  });

  console.log("Seed completed!");
  console.log("Login with:");
  console.log("- Client: 01111111111 / Password123");
  console.log("- Worker: 02222222222 / Password123");
  console.log("- Vendor: 03333333333 / Password123");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
