import { randomInt } from "node:crypto";

import { prisma } from "./prisma.js";
import { isDataImage, uploadDataImageToBlob } from "../modules/admin/hero-slides.storage.js";

export const AVATAR_LIBRARY_KEY = "worker_avatar_library";

export type AvatarLibraryItem = {
  id: string;
  url: string;
  // Matches a `workerProfessions` value from apps/web/lib/geo-data.ts (e.g. "plumber").
  // Left empty/omitted for a general-purpose photo not tied to one trade.
  category?: string;
};

// Matches apps/web/lib/geo-data.ts `workerProfessions` values.
const WORKER_CATEGORIES = [
  "plumber", "electrician", "carpenter", "painter", "ac-technician",
  "appliance-repair", "aluminum", "computer-repair", "networks", "cctv",
  "cleaning", "gypsum", "ceramic", "plastering", "ironwork", "finishing",
  "moving", "car-mechanic", "bike-mechanic", "engine-repair"
];

// DiceBear (dicebear.com) is a free, open-source avatar generator — no
// licensing to worry about. "big-smile" gives cheerful cartoon characters.
// Each seed renders a stable, unique-looking character.
function dicebearAvatar(seed: string) {
  const params = new URLSearchParams({
    seed,
    size: "200",
    backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
  });
  return `https://api.dicebear.com/9.x/big-smile/png?${params.toString()}`;
}

// Two starter cartoon avatars per trade, so the library isn't empty on day
// one. Admins can remove/replace/add to these from the Avatar Library admin
// page — whatever remains is the "approved" set.
const DEFAULT_AVATARS: AvatarLibraryItem[] = WORKER_CATEGORIES.flatMap((category) => [
  { id: `default-${category}-1`, category, url: dicebearAvatar(`${category}-1`) },
  { id: `default-${category}-2`, category, url: dicebearAvatar(`${category}-2`) }
]);

export async function getAvatarLibrary(): Promise<AvatarLibraryItem[]> {
  const setting = await prisma.systemSetting.findUnique({ where: { key: AVATAR_LIBRARY_KEY } });

  if (!setting) {
    // First run: seed with the starter set so the library isn't empty,
    // and persist it so admins can edit it from here on.
    return saveAvatarLibrary(DEFAULT_AVATARS);
  }

  try {
    const parsed = JSON.parse(setting.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAvatarLibrary(avatars: AvatarLibraryItem[]): Promise<AvatarLibraryItem[]> {
  const normalized = await Promise.all(
    avatars.map(async (avatar, index) => {
      if (!isDataImage(avatar.url)) return avatar;
      const url = await uploadDataImageToBlob(avatar.url, avatar.id ?? `avatar-${index + 1}`, "avatar-library");
      return { ...avatar, url };
    })
  );

  await prisma.systemSetting.upsert({
    where: { key: AVATAR_LIBRARY_KEY },
    update: { value: JSON.stringify(normalized), type: "json" },
    create: { key: AVATAR_LIBRARY_KEY, value: JSON.stringify(normalized), type: "json" }
  });

  return normalized;
}

// Picks a random image from the admin-approved avatar library, for workers
// who complete registration without uploading a profile photo. Prefers a
// photo tagged for the worker's trade, falling back to any approved photo.
export async function getRandomWorkerAvatar(category?: string | null): Promise<string | null> {
  const avatars = await getAvatarLibrary();
  if (avatars.length === 0) return null;

  const matching = category ? avatars.filter(avatar => avatar.category === category) : [];
  const pool = matching.length > 0 ? matching : avatars;

  const pick = pool[randomInt(0, pool.length)];
  return pick?.url ?? null;
}
