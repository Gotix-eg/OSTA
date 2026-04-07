import { z } from "zod";

const phoneSchema = z.string().min(10, "يجب أن يتكون رقم الهاتف من 10 أرقام على الأقل").max(20, "رقم الهاتف طويل جداً");
const passwordSchema = z.string().min(8, "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل").max(64, "كلمة المرور طويلة جداً");

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل").max(40, "الاسم الأول طويل جداً"),
    lastName: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل").max(40, "الاسم الأخير طويل جداً"),
    phone: phoneSchema,
    email: z.string().email("البريد الإلكتروني غير صالح").optional(),
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().nonempty("كلمة المرور مطلوبة")
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  type: z.enum(["registration", "login", "reset"])
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  phone: phoneSchema
});

export const resetPasswordSchema = z
  .object({
    phone: phoneSchema,
    code: z.string().length(6),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
