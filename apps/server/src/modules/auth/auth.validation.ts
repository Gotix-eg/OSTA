import { z } from "zod";

const phoneSchema = z.string().min(10).max(20);
const passwordSchema = z.string().min(8).max(64);

export const registerSchema = z
  .object({
    firstName: z.string().min(2).max(40),
    lastName: z.string().min(2).max(40),
    phone: phoneSchema,
    email: z.string().email().optional(),
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema
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
