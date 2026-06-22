import { config } from "dotenv";
import { z } from "zod";

config({ path: "../../.env" });

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().default("postgresql://osta:osta@localhost:5432/osta"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    JWT_SECRET: z.string().default("change-me"),
    JWT_REFRESH_SECRET: z.string().default("change-me-too"),
    APP_URL: z.string().default("http://localhost:3000")
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== "production") return;

    if (value.JWT_SECRET === "change-me" || value.JWT_SECRET.length < 32) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set to a strong production secret"
      });
    }

    if (value.JWT_REFRESH_SECRET === "change-me-too" || value.JWT_REFRESH_SECRET.length < 32) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET must be set to a strong production secret"
      });
    }
  });

export const env = envSchema.parse(process.env);
