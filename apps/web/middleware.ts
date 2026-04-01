import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedSegments = {
  client: ["CLIENT"],
  worker: ["WORKER"],
  admin: ["ADMIN", "SUPER_ADMIN"]
} as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(ar|en)\/(client|worker|admin)(?:\/.*)?$/);

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
    "/:locale/client",
    "/:locale/client/:path*",
    "/:locale/worker",
    "/:locale/worker/:path*",
    "/:locale/admin",
    "/:locale/admin/:path*"
  ]
};
