import { execSync } from "node:child_process";

if (process.env.VERCEL && process.env.DATABASE_URL) {
  console.log("[postinstall] Vercel build detected, syncing Prisma schema with `prisma db push`...");
  execSync("prisma db push --skip-generate", { stdio: "inherit" });
} else {
  console.log("[postinstall] Skipping `prisma db push` (not a Vercel build or DATABASE_URL not set).");
}
