import "dotenv/config";
import { PrismaClient, UserRole, UserStatus, WorkerVerificationStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const PENDING_WORKERS = [
  {
    firstName: "إبراهيم",
    lastName: "العوضي",
    phone: "+201099881101",
    email: "ibrahim.elawady@osta-pending.eg",
    profession: "electrician",
    nationalIdNumber: "29508120101234",
    yearsOfExperience: 6,
    guarantorName: "خالد العوضي",
    guarantorPhone: "+201099881100",
    avatarUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  },
  {
    firstName: "سامح",
    lastName: "شريف",
    phone: "+201099881102",
    email: "sameh.sherif@osta-pending.eg",
    profession: "plumber",
    nationalIdNumber: "29204150102345",
    yearsOfExperience: 8,
    guarantorName: "أحمد شريف",
    guarantorPhone: "+201099881199",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    status: WorkerVerificationStatus.DOCUMENTS_SUBMITTED
  },
  {
    firstName: "عمر",
    lastName: "فاروق",
    phone: "+201099881103",
    email: "omar.farouk@osta-pending.eg",
    profession: "acTechnician",
    nationalIdNumber: "29809220103456",
    yearsOfExperience: 5,
    guarantorName: "محمود فاروق",
    guarantorPhone: "+201099881198",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  },
  {
    firstName: "ياسر",
    lastName: "عبد المجيد",
    phone: "+201099881104",
    email: "yasser.abd@osta-pending.eg",
    profession: "carpenter",
    nationalIdNumber: "29011050104567",
    yearsOfExperience: 12,
    guarantorName: "سامي عبد المجيد",
    guarantorPhone: "+201099881197",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    status: WorkerVerificationStatus.AWAITING_ID
  },
  {
    firstName: "كريم",
    lastName: "جودة",
    phone: "+201099881105",
    email: "kareem.gouda@osta-pending.eg",
    profession: "painter",
    nationalIdNumber: "29603300105678",
    yearsOfExperience: 7,
    guarantorName: "هانى جودة",
    guarantorPhone: "+201099881196",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  },
  {
    firstName: "محمود",
    lastName: "سلامة",
    phone: "+201099881106",
    email: "mahmoud.salama@osta-pending.eg",
    profession: "aluminum",
    nationalIdNumber: "29407180106789",
    yearsOfExperience: 4,
    guarantorName: "حسين سلامة",
    guarantorPhone: "+201099881195",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    status: WorkerVerificationStatus.DOCUMENTS_SUBMITTED
  },
  {
    firstName: "أمير",
    lastName: "رشدي",
    phone: "+201099881107",
    email: "amir.roshdy@osta-pending.eg",
    profession: "applianceRepair",
    nationalIdNumber: "29712010107890",
    yearsOfExperience: 9,
    guarantorName: "فؤاد رشدي",
    guarantorPhone: "+201099881194",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  },
  {
    firstName: "وائل",
    lastName: "الجمل",
    phone: "+201099881108",
    email: "wael.elgamel@osta-pending.eg",
    profession: "cctv",
    nationalIdNumber: "29105250108901",
    yearsOfExperience: 6,
    guarantorName: "رضا الجمل",
    guarantorPhone: "+201099881193",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  },
  {
    firstName: "هشام",
    lastName: "بدوي",
    phone: "+201099881109",
    email: "hesham.badawey@osta-pending.eg",
    profession: "ceramic",
    nationalIdNumber: "29302140109012",
    yearsOfExperience: 11,
    guarantorName: "طارق بدوي",
    guarantorPhone: "+201099881192",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    status: WorkerVerificationStatus.DOCUMENTS_SUBMITTED
  },
  {
    firstName: "تامر",
    lastName: "الحسيني",
    phone: "+201099881110",
    email: "tamer.hoseiny@osta-pending.eg",
    profession: "finishing",
    nationalIdNumber: "29906100110123",
    yearsOfExperience: 10,
    guarantorName: "عاطف الحسيني",
    guarantorPhone: "+201099881191",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    status: WorkerVerificationStatus.UNDER_REVIEW
  }
];

async function seedPendingWorkers() {
  console.log("Seeding 10 pending workers for verification approval queue...");
  const commonPasswordHash = await hashPassword("Worker@123456");

  let createdCount = 0;
  for (const workerData of PENDING_WORKERS) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: workerData.phone }, { email: workerData.email }]
      }
    });

    if (existingUser) {
      console.log(`User ${workerData.phone} already exists, skipping.`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        firstName: workerData.firstName,
        lastName: workerData.lastName,
        phone: workerData.phone,
        email: workerData.email,
        passwordHash: commonPasswordHash,
        role: UserRole.WORKER,
        status: UserStatus.ACTIVE,
        avatarUrl: workerData.avatarUrl,
        addresses: {
          create: {
            governorate: "cairo",
            city: "cairo",
            area: "5th-settlement",
            street: "شارع التسعين الشمالي"
          }
        }
      }
    });

    await prisma.workerProfile.create({
      data: {
        userId: user.id,
        profession: workerData.profession,
        verificationStatus: workerData.status,
        nationalIdNumber: workerData.nationalIdNumber,
        yearsOfExperience: workerData.yearsOfExperience,
        guarantorName: workerData.guarantorName,
        guarantorPhone: workerData.guarantorPhone,
        nationalIdFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
        nationalIdBack: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
        selfieWithId: workerData.avatarUrl,
        criminalRecord: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80",
        utilityBillUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
        orderQuota: 0,
        walletBalance: 0,
        rating: 4.8,
        totalJobsCompleted: 0
      }
    });

    createdCount++;
    console.log(`Created pending worker: ${workerData.firstName} ${workerData.lastName} (${workerData.phone})`);
  }

  console.log(`Successfully created ${createdCount} pending workers.`);
}

seedPendingWorkers()
  .catch((e) => {
    console.error("Failed to seed pending workers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
