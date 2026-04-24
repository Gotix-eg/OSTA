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
  "https://web-gold-nu-39.vercel.app",
].filter(Boolean);

// Allow all Vercel preview deployments
const VERCEL_PREVIEW_REGEX = /^https:\/\/.*\.vercel\.app$/;

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin or from the same domain
        if (!origin || ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_REGEX.test(origin)) {
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
