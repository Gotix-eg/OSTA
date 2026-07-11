import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Checking Ahmed Tammam profile...");
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: "ahmed", mode: "insensitive" } },
          { lastName: { contains: "tammam", mode: "insensitive" } }
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
    console.log("All Workers in DB:");
    console.log(workers.map(w => ({
      id: w.id,
      name: `${w.user?.firstName} ${w.user?.lastName}`,
      profession: w.profession,
      specializations: w.specializations.map(s => s.service?.category?.slug)
    })));

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect()
  }
}

main()
