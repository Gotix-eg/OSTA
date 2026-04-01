import { config } from "dotenv";
import { z } from "zod";

config({ path: "../../.env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://osta:osta@localhost:5432/osta"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("change-me"),
  JWT_REFRESH_SECRET: z.string().default("change-me-too"),
  APP_URL: z.string().default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
