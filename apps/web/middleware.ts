import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedSegments = {
  client: ["CLIENT"],
  worker: ["WORKER"],
  vendor: ["VENDOR"],
  admin: ["ADMIN", "SUPER_ADMIN"]
} as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle legacy auth routes
  const legacyAuthMatch = pathname.match(/^\/(ar|en)\/auth\/(login|register|forgot-password|verify-otp)$/);
  if (legacyAuthMatch) {
    const [, locale, target] = legacyAuthMatch;
    // Map register to register/client by default
    const newTarget = target === "register" ? "register/client" : target;
    return NextResponse.redirect(new URL(`/${locale}/${newTarget}`, request.url));
  }

  const match = pathname.match(/^\/(ar|en)\/(client|worker|vendor|admin)(?:\/.*)?$/);

  if (!match) {
    return NextResponse.next();
  }

  const [, locale, segment] = match;
  const token = request.cookies.get("osta_access_token")?.value;
  const role = request.cookies.get("osta_user_role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const allowedRoles = protectedSegments[segment as keyof typeof protectedSegments] as readonly string[];

  if (!role || !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    return NextResponse.redirect(new URL(`/${locale}/dashboards`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:locale/:path*"
  ]
};
