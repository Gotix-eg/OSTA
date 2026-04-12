import { z } from "zod";

export const createAdCampaignSchema = z.object({
  type: z.enum(["BANNER", "SPONSORED_PROFILE"]),
  placement: z.enum(["HOMEPAGE", "WORKER_DASHBOARD", "SEARCH_TOP"]),
  title: z.string().min(1, "العنوان مطلوب"),
  imageUrl: z.string().url("رابط الصورة غير صحيح").optional().or(z.literal("")),
  targetUrl: z.string().url("الرابط غير صحيح").optional().or(z.literal("")),
  ownerId: z.string().optional()
});

export const updateAdStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "PAUSED", "FINISHED"])
});
