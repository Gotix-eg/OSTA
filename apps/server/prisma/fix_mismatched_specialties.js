import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function getCategorySlugFromProfession(profession) {
  if (!profession) return "electricity";
  const p = profession.toLowerCase().trim();
  if (p === "carpenter" || p === "نجار" || p.includes("نجار") || p.includes("carp")) return "carpentry";
  if (p === "plumber" || p === "سباك" || p.includes("سبا") || p.includes("plumb")) return "plumbing";
  if (p === "electrician" || p === "كهربائي" || p.includes("كهرب") || p.includes("electr")) return "electricity";
  if (p === "ac-technician" || p === "تكييف" || p.includes("تكيي") || p.includes("ac")) return "ac";
  if (p === "painter" || p === "نقاش" || p.includes("نقاش") || p.includes("دهان") || p.includes("paint")) return "painting";
  if (p === "aluminum" || p === "الوميتال" || p.includes("الوم") || p.includes("aluminum")) return "aluminum";
  if (p === "networks" || p === "شبكات" || p.includes("شبك") || p.includes("network")) return "networks";
  if (p === "computer" || p === "컴퓨터" || p === "كمبيوتر" || p.includes("كمبيو") || p.includes("comput") || p.includes("pc")) return "computer";
  if (p === "cctv" || p === "كاميرات" || p.includes("كامير") || p.includes("cctv")) return "cctv";
  if (p === "appliances" || p === "أجهزة" || p.includes("جهز") || p.includes("appliance")) return "appliances";
  if (p === "tiling" || p === "سيراميك" || p === "رخام" || p === "مبلط" || p.includes("مبلط") || p.includes("سيراميك") || p.includes("رخام") || p.includes("tile") || p.includes("tiling")) return "tiling";
  if (p === "plastering" || p === "محارة" || p.includes("محارة") || p.includes("plaster")) return "plastering";
  if (p === "ironwork" || p === "حداد" || p.includes("حداد") || p.includes("iron")) return "ironwork";
  if (p === "finishing" || p === "تشطيب" || p.includes("تشطيب") || p.includes("finish")) return "finishing";
  if (p === "gypsum" || p === "جبس" || p.includes("جبس") || p.includes("gypsum")) return "gypsum";
  if (p === "moving" || p === "نقل" || p.includes("نقل") || p.includes("move")) return "moving";
  if (p === "cleaning" || p === "نظافة" || p.includes("نظاف") || p.includes("clean")) return "cleaning";
  if (p === "car-mechanic" || p === "سيارات" || p.includes("سيار") || p.includes("car")) return "car_mechanic";
  if (p === "bike-mechanic" || p === "موتوسيكلات" || p.includes("موتوسيك") || p.includes("bike")) return "bike_mechanic";
  if (p === "engine-repair" || p === "مواتير" || p.includes("موتور") || p.includes("engine")) return "engine_repair";
  return "electricity";
}

async function main() {
  console.log("Starting DB fix for mismatched worker specialties...");
  try {
    const workers = await prisma.workerProfile.findMany({
      include: {
        user: true,
        specializations: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${workers.length} total workers in the database.`);

    for (const w of workers) {
      const correctSlug = getCategorySlugFromProfession(w.profession);
      const currentSlug = w.specializations[0]?.service?.category?.slug || "";

      if (currentSlug !== correctSlug) {
        console.log(`Mismatch detected for worker: ${w.user?.firstName} ${w.user?.lastName} (ID: ${w.id})`);
        console.log(`- Profession: "${w.profession}"`);
        console.log(`- Current category: "${currentSlug}"`);
        console.log(`- Correct category: "${correctSlug}"`);

        // Find the correct service
        const service = await prisma.service.findFirst({
          where: { category: { slug: correctSlug } }
        });

        if (service) {
          // Delete old specializations
          await prisma.workerSpecialization.deleteMany({
            where: { workerId: w.id }
          });

          // Create new specialization
          await prisma.workerSpecialization.create({
            data: {
              workerId: w.id,
              serviceId: service.id
            }
          });

          console.log(`=> Successfully updated specialization to "${correctSlug}"`);
        } else {
          console.warn(`=> Warning: Could not find any service for category "${correctSlug}"`);
        }
      }
    }

    console.log("Fix script completed successfully.");
  } catch (e) {
    console.error("Error during execution:", e);
  } finally {
    await prisma.$disconnect()
  }
}

main()
