import { z } from "zod";

export const updateSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string(),
  type: z.string().optional()
});

export const updateBulkSettingsSchema = z.object({
  settings: z.array(updateSettingSchema)
});
