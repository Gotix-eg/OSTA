import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { apiRouter } from "./routes/index.js";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  env.APP_URL,
  "https://www.ostafy.com",
  "https://ostafy.com",
  "https://osta.vercel.app",
  ...(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

const allowVercelPreviews =
  process.env.NODE_ENV !== "production" || process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === "true";
const VERCEL_PREVIEW_REGEX = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin, from allowed origins, or from local development ports
        const isLocal = origin && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"));
        if (
          !origin ||
          ALLOWED_ORIGINS.includes(origin) ||
          isLocal ||
          (allowVercelPreviews && VERCEL_PREVIEW_REGEX.test(origin))
        ) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(loggerMiddleware);

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
