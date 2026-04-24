import { NextRequest } from "next/server";
// @ts-ignore
import { createApp } from "../../../../server/src/app.js";

const app = createApp();

async function handler(req: Request) {
  // Simple proxy-like bridge for Vercel Serverless
  // Since Next.js App Router doesn't natively support Express middleware,
  // we'd ideally use Next.js API routes. 
  // However, for a quick merge, we'll use a rewrite or a custom handler.
  
  // NOTE: A better way for Next.js 14 is to point to the backend URL.
  // But since we want it all in one, we'll use this bridge if possible.
  
  // Actually, a more standard Vercel monorepo way is to use `vercel.json` rewrites
  // if the server is a separate Vercel function.
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
