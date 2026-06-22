import { createHash } from "node:crypto";
import { put } from "@vercel/blob";

const DATA_IMAGE_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\s]+)$/;

type HeroSlide = Record<string, unknown> & {
  id?: string;
  imageUrl?: string;
};

function extensionFromContentType(contentType: string) {
  switch (contentType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export function isDataImage(value: unknown): value is string {
  return typeof value === "string" && DATA_IMAGE_PATTERN.test(value);
}

export async function uploadDataImageToBlob(dataUrl: string, idHint: string) {
  const match = dataUrl.match(DATA_IMAGE_PATTERN);
  if (!match) return dataUrl;

  const contentType = match[1];
  const rawBase64 = match[2];
  if (!contentType || !rawBase64) return dataUrl;

  const buffer = Buffer.from(rawBase64.replace(/\s/g, ""), "base64");
  const digest = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const extension = extensionFromContentType(contentType);
  const safeId = idHint.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "slide";

  const blob = await put(`hero-slides/${safeId}-${digest}.${extension}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType
  });

  return blob.url;
}

export async function normalizeHeroSlidesForStorage(slides: HeroSlide[]) {
  let uploadedCount = 0;

  const normalized = await Promise.all(
    slides.map(async (slide, index) => {
      if (!isDataImage(slide.imageUrl)) return slide;

      const imageUrl = await uploadDataImageToBlob(slide.imageUrl, slide.id ?? `slide-${index + 1}`);
      uploadedCount += 1;
      return { ...slide, imageUrl };
    })
  );

  return { slides: normalized, uploadedCount };
}
