import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "ahmed.mahmoud", mode: "insensitive" } },
        {
          AND: [
            { firstName: { contains: "أحمد", mode: "insensitive" } },
            { lastName: { contains: "محمود", mode: "insensitive" } }
          ]
        },
        {
          AND: [
            { firstName: { contains: "Ahmed", mode: "insensitive" } },
            { lastName: { contains: "Mahmoud", mode: "insensitive" } }
          ]
        }
      ]
    },
    include: {
      workerProfile: {
        include: {
          certificates: true,
          serviceItems: true,
          specializations: { include: { service: true } }
        }
      }
    }
  });

  console.log(`Found ${users.length} users matching 'أحمد محمود':`);
  users.forEach((u) => {
    console.log(`- ID: ${u.id}, Name: ${u.firstName} ${u.lastName}, Email: ${u.email}, Role: ${u.role}, WorkerProfileID: ${u.workerProfile?.id || "None"}`);
  });

  for (const user of users) {
    let worker = user.workerProfile;
    if (!worker) {
      console.log(`Creating worker profile for user ${user.id}...`);
      worker = await prisma.workerProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "VERIFIED",
          bio: "فني سباكة معتمد وخبير في تأسيس وتجديد شبكات المياه والصرف الصحي للحمامات والمطابخ بأحدث الأجهزة والكشف عن التسريبات بدون تكسير.",
          yearsOfExperience: 10,
          education: ["دبلوم فني صناعي - قسم السباكة والتأسيس", "شهادة فني سباكة معتمد من الهيئة العامة للتدريب المهني"],
          achievements: [
            "تأسيس وصيانة أكثر من 350 مشروع حمام ومطبخ بالكامل",
            "حاصل على تقييم 4.9/5 لأعلى جودة تنفيذ وسرعة استجابة",
            "خبير الكشف عن تسريبات المياه باستخدام أجهزة الفحص الحراري والكهرومغناطيسي"
          ],
          contractInfo: "ضمان شامل 6 أشهر على جميع أعمال التأسيس والصيانة. أسعار ثابتة ومحددة مسبقاً بدون أي مصاريف إضافية.",
          galleryImages: [
            "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
          ],
          rating: 4.9,
          ratingCount: 48,
          totalJobsCompleted: 124,
          isAvailable: true,
          isOnline: true
        },
        include: {
          certificates: true,
          serviceItems: true,
          specializations: { include: { service: true } }
        }
      });
    }

    if (worker) {
      console.log(`Updating worker profile ${worker.id} for ${user.firstName} ${user.lastName}...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: "أحمد",
          lastName: "محمود",
          emailVerified: true
        }
      });

      await prisma.workerProfile.update({
        where: { id: worker.id },
        data: {
          verificationStatus: "VERIFIED",
          bio: "فني سباكة معتمد وخبير في تأسيس وتجديد شبكات المياه والصرف الصحي للحمامات والمطابخ بأحدث الأجهزة والكشف عن التسريبات بدون تكسير.",
          yearsOfExperience: 10,
          education: [
            "دبلوم فني صناعي - قسم السباكة والتأسيس",
            "شهادة فني سباكة معتمد من الهيئة العامة للتدريب المهني"
          ],
          achievements: [
            "تأسيس وصيانة أكثر من 350 مشروع حمام ومطبخ بالكامل",
            "حاصل على تقييم 4.9/5 لأعلى جودة تنفيذ وسرعة استجابة",
            "خبير الكشف عن تسريبات المياه باستخدام أجهزة الفحص الحراري والكهرومغناطيسي"
          ],
          contractInfo: "ضمان شامل 6 أشهر على جميع أعمال التأسيس والصيانة. أسعار ثابتة ومحددة مسبقاً بدون أي مصاريف إضافية.",
          galleryImages: [
            "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
          ],
          rating: 4.9,
          ratingCount: 48,
          totalJobsCompleted: 124,
          isAvailable: true,
          isOnline: true
        }
      });

      // Clear & recreate certificates
      await prisma.workerCertificate.deleteMany({ where: { workerId: worker.id } });
      await prisma.workerCertificate.createMany({
        data: [
          {
            workerId: worker.id,
            title: "شهادة السلامة والجودة لأعمال السباكة المنزلية",
            year: "2021",
            imageUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80",
            order: 0
          },
          {
            workerId: worker.id,
            title: "شهادة معتمدة في كشف التسريبات بالأجهزة الحديثة",
            year: "2023",
            imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
            order: 1
          }
        ]
      });

      // Clear & recreate service items
      await prisma.workerServiceItem.deleteMany({ where: { workerId: worker.id } });
      await prisma.workerServiceItem.createMany({
        data: [
          {
            workerId: worker.id,
            name: "تأسيس شبكة تغذية وصرف حمام كامل",
            price: "4500",
            note: "تشمل تركيب خطوط التغذية والصرف وتجربة الضغوط المعيارية",
            order: 0
          },
          {
            workerId: worker.id,
            name: "تركيب طقم صحي كامل (خلاطات، حوض، تواليت)",
            price: "1200",
            note: "تركيب محترف مع العزل والتثبيت الفني الشامل",
            order: 1
          },
          {
            workerId: worker.id,
            name: "كشف وفحص تسريبات المياه بدون تكسير",
            price: "350",
            note: "استخدام أجهزة الفحص الحراري والكهرومغناطيسي",
            order: 2
          },
          {
            workerId: worker.id,
            name: "تسليك وإصلاح انسداد الصرف الصحي والبالوعات",
            price: "250",
            note: "معالجة فورية باستخدام سوستة التسليك الكهروميكانيكية",
            order: 3
          },
          {
            workerId: worker.id,
            name: "تركيب وصيانة السخانات الكهربائية والغاز",
            price: "300",
            note: "تركيب آمن مع اختبار عوامل الأمان وعوامات الضغط",
            order: 4
          },
          {
            workerId: worker.id,
            name: "تركيب واستبدال مضخات المياه (المواتير)",
            price: "400",
            note: "شامل التوصيل الكهربائي وضبط الأوتوماتيك",
            order: 5
          }
        ]
      });

      console.log(`Successfully populated public profile for ${user.firstName} ${user.lastName} (Worker ID: ${worker.id})!`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
