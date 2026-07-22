import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, WorkerVerificationStatus, WorkerLevel } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const WORKERS_DATA = [
  {
    firstName: "أحمد",
    lastName: "محمود",
    phone: "+201011112201",
    email: "ahmed.mahmoud@osta-test.eg",
    profession: "سباك شاطر وسريع",
    bio: "خبرة أكثر من 8 سنوات في جميع أعمال السباكة والصيانة وتأسيس الحمامات والمطابخ.",
    lat: 30.0444,
    lng: 31.2357,
    governorate: "القاهرة",
    city: "مدينة نصر",
    yearsOfExperience: 8,
    categorySlug: "plumbing",
  },
  {
    firstName: "محمد",
    lastName: "إبراهيم",
    phone: "+201011112202",
    email: "mohamed.ibrahim@osta-test.eg",
    profession: "كهربائي سيليسيون منازل وفيلا",
    bio: "متخصص في تأسيس شبكات الكهرباء واللوحات والإنارة الحديثة والديكورات.",
    lat: 30.0561,
    lng: 31.3301,
    governorate: "القاهرة",
    city: "مصر الجديدة",
    yearsOfExperience: 10,
    categorySlug: "electricity",
  },
  {
    firstName: "حسن",
    lastName: "السيد",
    phone: "+201011112203",
    email: "hassan.elsayed@osta-test.eg",
    profession: "نجار أبواب وشبابيك وموبيليا",
    bio: "تصنيع وتصليح وتركيب جميع أنواع الأبواب والشبابيك والغرف وتركيب الكوالين.",
    lat: 30.0131,
    lng: 31.2089,
    governorate: "الجيزة",
    city: "الدقي",
    yearsOfExperience: 6,
    categorySlug: "carpentry",
  },
  {
    firstName: "محمود",
    lastName: "عبد الفتاح",
    phone: "+201011112204",
    email: "mahmoud.abdelfattah@osta-test.eg",
    profession: "فني تكييف وتبريد شباك وسبليت",
    bio: "فني تكييفات معتمد، تركيب، تنظيف بالضغط، شحن فريون، وصيانة جميع الأعطال.",
    lat: 29.9602,
    lng: 31.2569,
    governorate: "القاهرة",
    city: "المعادي",
    yearsOfExperience: 7,
    categorySlug: "ac",
  },
  {
    firstName: "طارق",
    lastName: "مصطفى",
    phone: "+201011112205",
    email: "tarek.moustafa@osta-test.eg",
    profession: "نقاش ودهانات وديكورات حديثة",
    bio: "دهانات حديثة، جوتن، قطيفة، ورق حائط، وديكورات جبسية بأعلى جودة تشطيب.",
    lat: 30.0771,
    lng: 31.2852,
    governorate: "القاهرة",
    city: "العباسية",
    yearsOfExperience: 9,
    categorySlug: "painting",
  },
  {
    firstName: "مصطفى",
    lastName: "كمال",
    phone: "+201011112206",
    email: "moustafa.kamal@osta-test.eg",
    profession: "فني ألوميتال وUPVC",
    bio: "تصنيع وصيانة شباك وبلكونة مطبخ ألوميتال، تغيير سلك ومفصلات ومقابض.",
    lat: 30.0074,
    lng: 31.4913,
    governorate: "القاهرة",
    city: "التجمع الخامس",
    yearsOfExperience: 5,
    categorySlug: "aluminum",
  },
  {
    firstName: "علي",
    lastName: "حسن",
    phone: "+201011112207",
    email: "ali.hassan@osta-test.eg",
    profession: "صيانة أجهزة منزلية وغسالات",
    bio: "صيانة غسالات أوتوماتيك وثلاجات وديب فريزر وميكروويف قطع غيار أصلية.",
    lat: 30.0075,
    lng: 30.9734,
    governorate: "الجيزة",
    city: "6 أكتوبر",
    yearsOfExperience: 11,
    categorySlug: "appliances",
  },
  {
    firstName: "إسلام",
    lastName: "فاروق",
    phone: "+201011112208",
    email: "eslam.farouk@osta-test.eg",
    profession: "مبلط سيراميك وبورسلين",
    bio: "تركيب سيراميك أرضيات وحوائط ورخام وبورسلين بميزان ليزر ودقة عالية.",
    lat: 30.0276,
    lng: 31.2104,
    governorate: "الجيزة",
    city: "العجوزة",
    yearsOfExperience: 12,
    categorySlug: "tiling",
  },
  {
    firstName: "كريم",
    lastName: "صلاح",
    phone: "+201011112209",
    email: "karim.salah@osta-test.eg",
    profession: "تركيب كاميرات مراقبة وأجهزة إنذار",
    bio: "تركيب شبكات كاميرات مراقبة IP وAnalog وأنظمة إنذار وحضور وانصراف.",
    lat: 30.0636,
    lng: 31.3435,
    governorate: "القاهرة",
    city: "مدينة نصر",
    yearsOfExperience: 4,
    categorySlug: "cctv",
  },
  {
    firstName: "سامح",
    lastName: "يوسف",
    phone: "+201011112210",
    email: "sameh.youssef@osta-test.eg",
    profession: "فني جبسبورد وديكور سقف",
    bio: "تركيب بيوت نور، أسقف معلقة، وشاشات جبس بورد بتشطيب احترافي.",
    lat: 30.0894,
    lng: 31.3142,
    governorate: "القاهرة",
    city: "الزيتون",
    yearsOfExperience: 6,
    categorySlug: "gypsum",
  },
];

async function main() {
  console.log("🛠️ Starting creation of 10 random realistic workers...");

  const passwordHash = await hashPassword("password123");
  const categories = await prisma.serviceCategory.findMany({
    include: { services: true },
  });

  let createdCount = 0;

  for (let i = 0; i < WORKERS_DATA.length; i++) {
    const data = WORKERS_DATA[i];
    const nationalId = `2900101${100000 + i}`;

    // Find category & service
    const category = categories.find((c) => c.slug === data.categorySlug) || categories[0];
    const service = category?.services[0];

    // Upsert User
    const user = await prisma.user.upsert({
      where: { phone: data.phone },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: UserRole.WORKER,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
      },
      create: {
        phone: data.phone,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.WORKER,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.phone}`,
      },
    });

    const rating = parseFloat((4.2 + (i % 7) * 0.1).toFixed(1));
    const totalJobsCompleted = Math.floor(15 + i * 8);

    // Upsert Worker Profile
    const workerProfile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {
        profession: data.profession,
        bio: data.bio,
        verificationStatus: WorkerVerificationStatus.VERIFIED,
        level: i % 2 === 0 ? WorkerLevel.VERIFIED : WorkerLevel.PRO,
        yearsOfExperience: data.yearsOfExperience,
        rating,
        ratingCount: Math.floor(totalJobsCompleted * 0.8),
        totalJobsCompleted,
        totalEarnings: totalJobsCompleted * 180,
        walletBalance: 250 + i * 50,
        isAvailable: true,
        isOnline: true,
        lastLocationLat: data.lat,
        lastLocationLng: data.lng,
        lastLocationUpdatedAt: new Date(),
        nationalIdNumber: nationalId,
      },
      create: {
        userId: user.id,
        profession: data.profession,
        bio: data.bio,
        verificationStatus: WorkerVerificationStatus.VERIFIED,
        level: i % 2 === 0 ? WorkerLevel.VERIFIED : WorkerLevel.PRO,
        yearsOfExperience: data.yearsOfExperience,
        rating,
        ratingCount: Math.floor(totalJobsCompleted * 0.8),
        totalJobsCompleted,
        totalEarnings: totalJobsCompleted * 180,
        walletBalance: 250 + i * 50,
        isAvailable: true,
        isOnline: true,
        lastLocationLat: data.lat,
        lastLocationLng: data.lng,
        lastLocationUpdatedAt: new Date(),
        nationalIdNumber: nationalId,
      },
    });

    // Add Specialization
    if (service) {
      await prisma.workerSpecialization.upsert({
        where: {
          workerId_serviceId: {
            workerId: workerProfile.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          workerId: workerProfile.id,
          serviceId: service.id,
        },
      });
    }

    // Add Work Area
    await prisma.workerArea.deleteMany({
      where: { workerId: workerProfile.id },
    });

    await prisma.workerArea.create({
      data: {
        workerId: workerProfile.id,
        governorate: data.governorate,
        city: data.city,
        area: "الكل",
      },
    });

    createdCount++;
    console.log(`✅ [${createdCount}/10] Created worker: ${data.firstName} ${data.lastName} (${data.profession}) - ID: ${workerProfile.id}`);
  }

  console.log("\n🎉 Successfully created 10 random workers!");
}

main()
  .catch((err) => {
    console.error("❌ Error seeding workers:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
