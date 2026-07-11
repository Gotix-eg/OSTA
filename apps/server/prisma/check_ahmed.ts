import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Checking Ahmed Tammam profile...");
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: "ahmed" } },
          { lastName: { contains: "tammam" } }
        ]
      },
      include: {
        workerProfile: {
          include: {
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
        }
      }
    });

    console.log("User:", JSON.stringify(user, null, 2));

    const categories = await prisma.category.findMany();
    console.log("Available Categories in DB:");
    console.log(categories.map(c => ({ id: c.id, slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn })));

  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect()
  }
}

main()
