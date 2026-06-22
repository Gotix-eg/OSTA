import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { normalizeHeroSlidesForStorage } from "../modules/admin/hero-slides.storage.js";

const SLIDES_KEY = "hero_slides";

async function main() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: SLIDES_KEY } });
  if (!setting) {
    console.log("No hero_slides setting found.");
    return;
  }

  const parsed = JSON.parse(setting.value);
  if (!Array.isArray(parsed)) {
    throw new Error("hero_slides setting is not an array");
  }

  const { slides, uploadedCount } = await normalizeHeroSlidesForStorage(parsed);
  if (uploadedCount === 0) {
    console.log("No inline hero slide images found. Nothing to migrate.");
    return;
  }

  const backupKey = `${SLIDES_KEY}_backup_before_blob_${new Date().toISOString().replace(/[:.]/g, "-")}`;

  await prisma.$transaction(async (tx) => {
    await tx.systemSetting.create({
      data: {
        key: backupKey,
        value: setting.value,
        type: "json"
      }
    });

    await tx.systemSetting.update({
      where: { key: SLIDES_KEY },
      data: {
        value: JSON.stringify(slides),
        type: "json"
      }
    });
  });

  console.log(`Migrated ${uploadedCount} hero slide image(s) to Vercel Blob.`);
  console.log(`Backup saved in SystemSetting as ${backupKey}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
