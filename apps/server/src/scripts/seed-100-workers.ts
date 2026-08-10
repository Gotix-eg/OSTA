import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, WorkerVerificationStatus, WorkerLevel } from "@prisma/client";
import { hashPassword } from "../utils/password.js";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "أحمد", "محمد", "محمود", "علي", "حسن", "حسين", "مصطفى", "إبراهيم", "طارق", "سامح",
  "خالد", "عمرو", "شريف", "عمر", "كريم", "أيمن", "وليد", "ياسر", "هشام", "هاني",
  "إيهاب", "ماهر", "عادل", "صلاح", "عصام", "مجدي", "سعيد", "جمال", "أسامة", "أشرف"
];

const LAST_NAMES = [
  "السيد", "عبد الرحمن", "حسن", "محمود", "إبراهيم", "سليمان", "عبد الله", "مصطفى", "فاروق", "عثمان",
  "توفيق", "رمضان", "زكي", "كامل", "حسين", "فهمي", "صالح", "الشافعي", "الباز", "النجار",
  "الحداد", "الدسوقي", "غنيم", "عامر", "سالم", "جاد", "علام", "مطر", "منصور", "شاهين"
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

const AREAS_POOL = [
  // Cairo
  { governorate: "cairo", city: "new-cairo", area: "5th-settlement" },
  { governorate: "cairo", city: "nasr-city", area: "1st-district" },
  { governorate: "cairo", city: "maadi", area: "sarayat-maadi" },
  { governorate: "cairo", city: "heliopolis", area: "korba" },
  { governorate: "cairo", city: "shobra", area: "shobra-el-balad" },
  { governorate: "cairo", city: "downtown", area: "talaat-harb" },
  { governorate: "cairo", city: "mokattam", area: "upper-plateau" },
  { governorate: "cairo", city: "shorouk", area: "district-1" },
  { governorate: "cairo", city: "badr", area: "central-district" },
  { governorate: "cairo", city: "new-cairo", area: "rehab" },
  { governorate: "cairo", city: "nasr-city", area: "7th-district" },
  { governorate: "cairo", city: "maadi", area: "degla" },

  // Giza
  { governorate: "giza", city: "6th-october", area: "1st-district" },
  { governorate: "giza", city: "sheikh-zayed", area: "green-belt" },
  { governorate: "giza", city: "dokki", area: "tahrir" },
  { governorate: "giza", city: "mohandessin", area: "gameat-eldowel" },
  { governorate: "giza", city: "haram", area: "mishaal" },
  { governorate: "giza", city: "faisal", area: "ismail-emababi" },
  { governorate: "giza", city: "hadayek-ahram", area: "gate-1" },
  { governorate: "giza", city: "agouza", area: "nawal" },
  { governorate: "giza", city: "6th-october", area: "downtown" },

  // Alexandria
  { governorate: "alexandria", city: "smouha", area: "victor-emmanuel" },
  { governorate: "alexandria", city: "miami", area: "45th-street" },
  { governorate: "alexandria", city: "sidi-bishr", area: "sidi-bishr-bahary" },
  { governorate: "alexandria", city: "mandara", area: "mandara-bahary" },
  { governorate: "alexandria", city: "stanley", area: "corniche" },
  { governorate: "alexandria", city: "agami", area: "hanoville" },

  // Delta & Canal
  { governorate: "dakahlia", city: "mansoura", area: "gehan" },
  { governorate: "dakahlia", city: "talkha", area: "corniche" },
  { governorate: "sharkia", city: "zagazig", area: "al-qawmeya" },
  { governorate: "sharkia", city: "10th-ramadan", area: "1st-district" },
  { governorate: "qalyubia", city: "banha", area: "al-vilal" },
  { governorate: "qalyubia", city: "obour", area: "7th-district" },
  { governorate: "gharbia", city: "tanta", area: "al-bahr" },
  { governorate: "gharbia", city: "mahalla", area: "shokry-el-kowatly" },
  { governorate: "monufia", city: "shibin", area: "al-galaa" },
  { governorate: "monufia", city: "sadat", area: "1st-zone" },
  { governorate: "beheira", city: "damanhour", area: "al-gomhorya" },
  { governorate: "ismailia", city: "ismailia-city", area: "al-sheikh-zayed" },
  { governorate: "suez", city: "suez-city", area: "al-arbaeen" },
  { governorate: "port-said", city: "sharq", area: "port-fouad" },
  { governorate: "damietta", city: "new-damietta", area: "central-zone" },

  // Upper Egypt & Red Sea & Sinai
  { governorate: "red-sea", city: "hurghada", area: "kawther" },
  { governorate: "red-sea", city: "gouna", area: "abu-tig-marina" },
  { governorate: "matrouh", city: "marsa-matrouh", area: "corniche" },
  { governorate: "matrouh", city: "el-alamein", area: "new-alamein" },
  { governorate: "luxor", city: "luxor-city", area: "television-street" },
  { governorate: "aswan", city: "aswan-city", area: "corniche" },
  { governorate: "sohag", city: "sohag-city", area: "east-district" },
  { governorate: "assiut", city: "assiut-city", area: "youssry-ragheb" },
  { governorate: "minya", city: "minya-city", area: "taha-hussein" },
  { governorate: "qena", city: "qena-city", area: "al-mahatta" },
  { governorate: "fayoum", city: "fayoum-city", area: "al-mesalla" },
  { governorate: "beni-suef", city: "beni-suef-city", area: "al-dawahe" },
  { governorate: "kafr-el-sheikh", city: "kafr-el-sheikh-city", area: "al-nadi" },
  { governorate: "south-sinai", city: "sharm", area: "naama-bay" },
  { governorate: "south-sinai", city: "dahab", area: "lighthouse" }
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

const LEVELS = [
  WorkerLevel.NEW,
  WorkerLevel.ACTIVE,
  WorkerLevel.PROFESSIONAL,
  WorkerLevel.EXPERT,
  WorkerLevel.DIAMOND
];

const SUBSCRIPTION_TIERS = ["free", "pro", "featured"];

async function main() {
  console.log("🚀 Seeding active areas into system...");

  // Seed Area table
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

  console.log("🚀 Starting seeding 100 VERIFIED workers with DIFFERENT cities...");

  // Get all active services from DB
  const services = await prisma.service.findMany({ where: { isActive: true } });
  if (services.length === 0) {
    console.error("❌ No services found in DB. Please run base seed first.");
    process.exit(1);
  }
  console.log(`📋 Found ${services.length} active services in database.`);

  const passwordHash = await hashPassword("Password123!");

  let createdCount = 0;

  for (let i = 1; i <= 100; i++) {
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const profession = PROFESSIONS[(i - 1) % PROFESSIONS.length];
    const level = LEVELS[(i - 1) % LEVELS.length];
    const tier = SUBSCRIPTION_TIERS[(i - 1) % SUBSCRIPTION_TIERS.length];
    const avatarUrl = getWorkerAvatarUrl(i);
    
    // Unique credentials
    const phone = `+201090${String(i).padStart(6, '0')}`;
    const email = `worker.v100.${i}@osta.eg`;
    const nationalIdNumber = `2950${String(i).padStart(10, '0')}`;

    // Select services
    const selectedService1 = services[(i - 1) % services.length];
    const selectedService2 = services[(i + 3) % services.length];

    // Assign DISTINCT city/area to each worker
    const primaryArea = AREAS_POOL[(i - 1) % AREAS_POOL.length];
    const secondaryArea = AREAS_POOL[(i + 17) % AREAS_POOL.length];

    const workerAreasMap = new Map<string, { governorate: string; city: string; area: string }>();
    workerAreasMap.set(`${primaryArea.governorate}-${primaryArea.city}-${primaryArea.area}`, primaryArea);
    if (primaryArea.city !== secondaryArea.city) {
      workerAreasMap.set(`${secondaryArea.governorate}-${secondaryArea.city}-${secondaryArea.area}`, secondaryArea);
    }
    const workerAreas = Array.from(workerAreasMap.values());

    const rating = Math.round((4.0 + (i % 11) * 0.1) * 10) / 10;
    const ratingCount = 5 + (i * 3) % 45;
    const totalJobsCompleted = 10 + (i * 4) % 110;
    const yearsOfExperience = 2 + (i % 18);
    const totalEarnings = totalJobsCompleted * (150 + (i % 5) * 50);
    const walletBalance = 100 + (i * 37) % 2500;
    const isOnline = i % 2 === 0;

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
        acceptanceRate: 96.5,
        avgResponseTime: 12,
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
        acceptanceRate: 96.5,
        avgResponseTime: 12,
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

    // Add distinct work areas for each worker
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
    if (createdCount % 20 === 0) {
      console.log(`✅ Seeded ${createdCount}/100 verified workers with DIFFERENT cities...`);
    }
  }

  console.log(`🎉 Successfully updated ${createdCount} verified workers across DIFFERENT cities and governorates!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding workers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
