import { z } from "zod";

export const registerVendorSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
  lastName: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(8),
  shopName: z.string().min(2, "اسم المحل يجب أن يكون حرفين على الأقل"),
  shopNameAr: z.string().optional(),
  category: z.string().min(2, "التصنيف مطلوب"),
  governorate: z.string().min(2, "المحافظة مطلوبة"),
  city: z.string().min(2, "المدينة مطلوبة"),
  area: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const updateVendorProfileSchema = z.object({
  shopName: z.string().min(2).optional(),
  shopNameAr: z.string().optional(),
  category: z.string().optional(),
  shopDescription: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  deliveryRange: z.number().min(1).max(50).optional(),
});

export const updateVendorLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateVendorStatusSchema = z.object({
  isOpen: z.boolean(),
});

export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;
export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
