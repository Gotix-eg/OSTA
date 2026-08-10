import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, WorkerVerificationStatus, WorkerLevel } from "@prisma/client";
import { hashPassword } from "../utils/password.js";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "أحمد", "محمد", "محمود", "علي", "حسن", "حسين", "مصطفى", "إبراهيم", "طارق", "سامح",
  "خالد", "عمرو", "شريف", "عمر", "كريم", "أيمن", "وليد", "ياسر", "هشام", "هاني",
  "إيهاب", "ماهر", "عادل", "صلاح", "عصام", "مجدي", "سعيد", "جمال", "أسامة", "أشرف",
  "تامر", "زياد", "حمزة", "بلال", "عثمان", "يوسف", "سيف", "معتز", "نبيل", "فاروق"
];

const LAST_NAMES = [
  "السيد", "عبد الرحمن", "حسن", "محمود", "إبراهيم", "سليمان", "عبد الله", "مصطفى", "فاروق", "عثمان",
  "توفيق", "رمضان", "زكي", "كامل", "حسين", "فهمي", "صالح", "الشافعي", "الباز", "النجار",
  "الحداد", "الدسوقي", "غنيم", "عامر", "سالم", "جاد", "علام", "مطر", "منصور", "شاهين",
  "رضوان", "الجوهري", "شلبي", "عبد المجيد", "زهران", "مرسي", "الحسيني", "عفيفي", "خليل", "الصاوي"
];

const PROFESSIONS = [
  "فني كهرباء منازل وتأسيس",
  "سباك صيانة وتأسيس سباكة",
  "فني تكييف وتبريد معتمد",
  "نجار تركيب وتصليح أثاث",
  "فني دهانات وديكورات حديثة",
  "فني صيانة أجهزة منزلية",
  "مبلط سيراميك ورخام",
  "فني تركيبات ألوميتال ومطابخ",
  "فني أنظمة كاميرات مراقبة",
  "حداد فورجيه وكريتال",
  "فني أسقف معلقة وجبس بورد",
  "فني شبكات ودش مركزي",
  "ميكانيكي سيارات وصيانة دورية",
  "فني نقل وتغليف أثاث منازل",
  "فني صيانة مواتير مياه وطلمبات"
];

// Locations in Arabic language
const AREAS_POOL = [
  // القاهرة
  { governorate: "القاهرة", city: "القاهرة الجديدة", area: "التجمع الخامس" },
  { governorate: "القاهرة", city: "مدينة نصر", area: "الحي الأول" },
  { governorate: "القاهرة", city: "المعادي", area: "سرايات المعادي" },
  { governorate: "القاهرة", city: "مصر الجديدة", area: "الكوربة" },
  { governorate: "القاهرة", city: "شبرا", area: "شبرا البلد" },
  { governorate: "القاهرة", city: "وسط البلد", area: "طلعت حرب" },
  { governorate: "القاهرة", city: "المقطم", area: "الهضبة العليا" },
  { governorate: "القاهرة", city: "الشروق", area: "الحي الأول" },
  { governorate: "القاهرة", city: "مدينة بدر", area: "المنطقة المركزية" },
  { governorate: "القاهرة", city: "القاهرة الجديدة", area: "الرحاب" },
  { governorate: "القاهرة", city: "القاهرة الجديدة", area: "مدينتي" },
  { governorate: "القاهرة", city: "مدينة نصر", area: "الحي السابع" },
  { governorate: "القاهرة", city: "المعادي", area: "دجلة" },
  { governorate: "القاهرة", city: "حلوان", area: "حلوان المركزية" },
  { governorate: "القاهرة", city: "عين شمس", area: "النزهة" },

  // الجيزة
  { governorate: "الجيزة", city: "6 أكتوبر", area: "الحي الأول" },
  { governorate: "الجيزة", city: "الشيخ زايد", area: "الحزام الأخضر" },
  { governorate: "الجيزة", city: "الدقي", area: "ميدان التحرير" },
  { governorate: "الجيزة", city: "المهندسين", area: "جامعة الدول العربية" },
  { governorate: "الجيزة", city: "الهرم", area: "مشعل" },
  { governorate: "الجيزة", city: "فيصل", area: "إسماعيل إمبابي" },
  { governorate: "الجيزة", city: "حدائق الأهرام", area: "البوابة الأولى" },
  { governorate: "الجيزة", city: "العجوزة", area: "شارع نوال" },
  { governorate: "الجيزة", city: "6 أكتوبر", area: "وسط البلد" },
  { governorate: "الجيزة", city: "إمبابة", area: "المطار" },

  // الإسكندرية
  { governorate: "الإسكندرية", city: "سموحة", area: "فيكتور إيمانويل" },
  { governorate: "الإسكندرية", city: "ميامي", area: "شارع 45" },
  { governorate: "الإسكندرية", city: "سيدي بشر", area: "سيدي بشر بحري" },
  { governorate: "الإسكندرية", city: "المندرة", area: "المندرة بحري" },
  { governorate: "الإسكندرية", city: "ستانلي", area: "الكورنيش" },
  { governorate: "الإسكندرية", city: "العجمي", area: "هانوفيل" },
  { governorate: "الإسكندرية", city: "رشدي", area: "المعسكر الروماني" },
  { governorate: "الإسكندرية", city: "برج العرب", area: "المنطقة الصناعية" },

  // الدلتا والقناة
  { governorate: "الدقهلية", city: "المنصورة", area: "شارع جيهان" },
  { governorate: "الدقهلية", city: "طلخا", area: "الكورنيش" },
  { governorate: "الشرقية", city: "الزقازيق", area: "القومية" },
  { governorate: "الشرقية", city: "العاشر من رمضان", area: "الحي الأول" },
  { governorate: "القليوبية", city: "بنها", area: "الفيلا" },
  { governorate: "القليوبية", city: "مدينة العبور", area: "الحي السابع" },
  { governorate: "الغربية", city: "طنطا", area: "شارع البحر" },
  { governorate: "الغربية", city: "المحلة الكبرى", area: "شكري القواتلي" },
  { governorate: "المنوفية", city: "شبين الكوم", area: "شارع الجلاء" },
  { governorate: "المنوفية", city: "مدينة السادات", area: "المنطقة الأولى" },
  { governorate: "البحيرة", city: "دمنهور", area: "شارع الجمهورية" },
  { governorate: "الإسماعيلية", city: "مدينة الإسماعيلية", area: "الشيخ زايد" },
  { governorate: "السويس", city: "مدينة السويس", area: "الأربعين" },
  { governorate: "بورسعيد", city: "بورفؤاد", area: "حي الشرق" },
  { governorate: "دمياط", city: "دمياط الجديدة", area: "المنطقة المركزية" },

  // الصعيد والبحر الأحمر وسيناء
  { governorate: "البحر الأحمر", city: "الغردقة", area: "الكوثر" },
  { governorate: "البحر الأحمر", city: "الجونة", area: "مارينا أبو تيج" },
  { governorate: "مطروح", city: "مرسى مطروح", area: "الكورنيش" },
  { governorate: "مطروح", city: "العلمين", area: "العلمين الجديدة" },
  { governorate: "الأقصر", city: "مدينة الأقصر", area: "شارع التلفزيون" },
  { governorate: "أسوان", city: "مدينة أسوان", area: "الكورنيش" },
  { governorate: "سوهاج", city: "مدينة سوهاج", area: "حي شرق" },
  { governorate: "أسيوط", city: "مدينة أسيوط", area: "يسري راغب" },
  { governorate: "المنيا", city: "مدينة المنيا", area: "طه حسين" },
  { governorate: "قنا", city: "مدينة قنا", area: "المحطة" },
  { governorate: "الفيوم", city: "مدينة الفيوم", area: "المسلة" },
  { governorate: "بني سويف", city: "مدينة بني سويف", area: "الدواخلية" },
  { governorate: "كفر الشيخ", city: "مدينة كفر الشيخ", area: "شارع النادي" },
  { governorate: "جنوب سيناء", city: "شرم الشيخ", area: "خليج نعمة" },
  { governorate: "جنوب سيناء", city: "دهب", area: "اللايتهاوس" }
];

const CURATED_UNSPLASH_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552058544-a2b7222539f4?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=80"
];

const WORK_PHOTOS = [
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop&q=80"
];

function getWorkerAvatarUrl(index: number): string {
  if (index <= CURATED_UNSPLASH_AVATARS.length) {
    return CURATED_UNSPLASH_AVATARS[index - 1];
  }
  if (index % 2 === 0) {
    const portraitNum = ((index - 1) % 99) + 1;
    return `https://randomuser.me/api/portraits/men/${portraitNum}.jpg`;
  } else {
    const avatarNum = ((index - 1) % 70) + 1;
    return `https://i.pravatar.cc/300?img=${avatarNum}`;
  }
}

const SUBSCRIPTION_TIERS = ["free", "pro", "featured"];

async function main() {
  console.log("🚀 Seeding active Arabic areas into system...");

  // Seed Area table with Arabic location names
  for (const a of AREAS_POOL) {
    await prisma.area.upsert({
      where: {
        governorate_city_area: {
          governorate: a.governorate,
          city: a.city,
          area: a.area
        }
      },
      update: { isActive: true },
      create: {
        governorate: a.governorate,
        city: a.city,
        area: a.area,
        isActive: true
      }
    });
  }

  console.log("🚀 Starting seeding 200 VERIFIED workers with ARABIC locations...");

  // Get all active services from DB
  const services = await prisma.service.findMany({ where: { isActive: true } });
  if (services.length === 0) {
    console.error("❌ No services found in DB. Please run base seed first.");
    process.exit(1);
  }
  console.log(`📋 Found ${services.length} active services in database.`);

  const passwordHash = await hashPassword("Password123!");

  let createdCount = 0;

  // Seed 200 Workers with Arabic locations
  for (let i = 1; i <= 200; i++) {
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const profession = PROFESSIONS[(i - 1) % PROFESSIONS.length];
    const tier = SUBSCRIPTION_TIERS[(i - 1) % SUBSCRIPTION_TIERS.length];
    const avatarUrl = getWorkerAvatarUrl(i);
    
    // Unique credentials
    const phone = `+201090${String(i).padStart(6, '0')}`;
    const email = `worker.v200.${i}@osta.eg`;
    const nationalIdNumber = `2950${String(i).padStart(10, '0')}`;

    // Select services
    const selectedService1 = services[(i - 1) % services.length];
    const selectedService2 = services[(i + 3) % services.length];

    // Assign ARABIC city/area to each worker
    const primaryArea = AREAS_POOL[(i - 1) % AREAS_POOL.length];
    const secondaryArea = AREAS_POOL[(i + 17) % AREAS_POOL.length];

    const workerAreasMap = new Map<string, { governorate: string; city: string; area: string }>();
    workerAreasMap.set(`${primaryArea.governorate}-${primaryArea.city}-${primaryArea.area}`, primaryArea);
    if (primaryArea.city !== secondaryArea.city) {
      workerAreasMap.set(`${secondaryArea.governorate}-${secondaryArea.city}-${secondaryArea.area}`, secondaryArea);
    }
    const workerAreas = Array.from(workerAreasMap.values());

    // Generate VARYING ratings from 3.2 to 5.0
    const ratingStep = ((i * 3) % 19);
    const rating = Math.round((3.2 + ratingStep * 0.1) * 10) / 10;

    const ratingCount = 3 + (i * 7) % 120;
    const totalJobsCompleted = 5 + (i * 9) % 200;
    const yearsOfExperience = 1 + (i % 22);
    const totalEarnings = totalJobsCompleted * (160 + (i % 7) * 45);
    const walletBalance = 50 + (i * 41) % 3200;
    const isOnline = i % 2 === 0;

    // Determine level dynamically
    let level: WorkerLevel = WorkerLevel.NEW;
    if (totalJobsCompleted > 120 && rating >= 4.7) level = WorkerLevel.DIAMOND;
    else if (totalJobsCompleted > 70 && rating >= 4.4) level = WorkerLevel.EXPERT;
    else if (totalJobsCompleted > 30 && rating >= 4.0) level = WorkerLevel.PROFESSIONAL;
    else if (totalJobsCompleted > 10) level = WorkerLevel.ACTIVE;

    const bio = `فني ${profession} محترف بخبرة أكثر من ${yearsOfExperience} سنوات في مجال الصيانات والتركيبات. ألتزم بالمواعيد وجودة العمل وإرضاء العملاء.`;

    const galleryImages = [
      WORK_PHOTOS[(i - 1) % WORK_PHOTOS.length],
      WORK_PHOTOS[(i + 3) % WORK_PHOTOS.length]
    ];

    // Upsert User
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        firstName: fn,
        lastName: ln,
        email,
        avatarUrl,
        status: UserStatus.ACTIVE,
        role: UserRole.WORKER,
        phoneVerified: true,
        emailVerified: true,
      },
      create: {
        phone,
        email,
        passwordHash,
        firstName: fn,
        lastName: ln,
        avatarUrl,
        role: UserRole.WORKER,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
        emailVerified: true,
        preferredLanguage: "ar",
      }
    });

    // Upsert Worker Profile
    const profile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {
        verificationStatus: WorkerVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "admin-system",
        profession,
        level,
        subscriptionTier: tier,
        yearsOfExperience,
        bio,
        rating,
        ratingCount,
        totalJobsCompleted,
        totalEarnings,
        walletBalance,
        commissionRate: 15,
        isAvailable: true,
        isOnline,
        nationalIdNumber,
        nationalIdFront: "https://images.unsplash.com/photo-1544717305-2782549b5136",
        nationalIdBack: "https://images.unsplash.com/photo-1544717305-2782549b5136",
        selfieWithId: avatarUrl,
        galleryImages,
        acceptanceRate: Math.round((85 + (i % 15)) * 10) / 10,
        avgResponseTime: 5 + (i % 25),
      },
      create: {
        userId: user.id,
        verificationStatus: WorkerVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: "admin-system",
        profession,
        level,
        subscriptionTier: tier,
        yearsOfExperience,
        bio,
        rating,
        ratingCount,
        totalJobsCompleted,
        totalEarnings,
        walletBalance,
        commissionRate: 15,
        isAvailable: true,
        isOnline,
        nationalIdNumber,
        nationalIdFront: "https://images.unsplash.com/photo-1544717305-2782549b5136",
        nationalIdBack: "https://images.unsplash.com/photo-1544717305-2782549b5136",
        selfieWithId: avatarUrl,
        galleryImages,
        acceptanceRate: Math.round((85 + (i % 15)) * 10) / 10,
        avgResponseTime: 5 + (i % 25),
      }
    });

    // Clean relations
    await prisma.workerSpecialization.deleteMany({ where: { workerId: profile.id } });
    await prisma.workerArea.deleteMany({ where: { workerId: profile.id } });
    await prisma.workSchedule.deleteMany({ where: { workerId: profile.id } });

    // Add specializations
    await prisma.workerSpecialization.createMany({
      data: [
        { workerId: profile.id, serviceId: selectedService1.id },
        ...(selectedService1.id !== selectedService2.id ? [{ workerId: profile.id, serviceId: selectedService2.id }] : [])
      ]
    });

    // Add distinct ARABIC work areas for each worker
    await prisma.workerArea.createMany({
      data: workerAreas.map(wa => ({
        workerId: profile.id,
        governorate: wa.governorate,
        city: wa.city,
        area: wa.area
      }))
    });

    // Add weekly work schedule
    await prisma.workSchedule.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => ({
        workerId: profile.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "21:00",
        isAvailable: dayOfWeek !== 5
      }))
    });

    createdCount++;
    if (createdCount % 25 === 0) {
      console.log(`✅ Seeded ${createdCount}/200 verified workers in ARABIC...`);
    }
  }

  console.log(`🎉 Successfully created/updated ${createdCount} verified workers with ARABIC locations!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding 200 workers in Arabic:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
