import { z } from "zod";
import { DeliveryMethod, MaterialPaymentMethod } from "@prisma/client";

export const createMaterialRequestSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  description: z.string().min(5, "الوصف مطلوب (5 أحرف على الأقل)"),
  images: z.array(z.string().url()).optional(),
  voiceNote: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deliveryMethod: z.nativeEnum(DeliveryMethod).optional().default("VENDOR_DELIVERY"),
});

export const createMaterialOfferSchema = z.object({
  price: z.number().min(1, "السعر مطلوب"),
  deliveryFee: z.number().min(0).optional().default(0),
  estimatedDeliveryTime: z.number().min(5, "وقت التوصيل مطلوب (بالدقائق)"),
  notes: z.string().optional(),
});

export const acceptOfferSchema = z.object({
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  paymentMethod: z.nativeEnum(MaterialPaymentMethod).optional().default("CASH_ON_DELIVERY"),
});

export type CreateMaterialRequestInput = z.infer<typeof createMaterialRequestSchema>;
export type CreateMaterialOfferInput = z.infer<typeof createMaterialOfferSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
