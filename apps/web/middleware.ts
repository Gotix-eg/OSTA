import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedSegments = {
  client: ["CLIENT"],
  worker: ["WORKER"],
  vendor: ["VENDOR"],
  admin: ["ADMIN", "SUPER_ADMIN"]
} as const;

function withNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  return response;
}

type VerifiedAccessToken = {
  role?: string;
  exp?: number;
};

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function verifyJwt(token: string): Promise<VerifiedAccessToken | null> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedHeader))) as { alg?: string };
    if (header.alg !== "HS256") {
      return null;
    }

    const secret = process.env.JWT_SECRET ?? "change-me";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as VerifiedAccessToken;
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
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

  if (!token) {
    const loginTarget = segment === "admin" ? "login/admin" : "login";
    return withNoStore(NextResponse.redirect(new URL(`/${locale}/${loginTarget}`, request.url)));
  }

  const payload = await verifyJwt(token);
  const role = payload?.role;

  if (!role) {
    const loginTarget = segment === "admin" ? "login/admin" : "login";
    return withNoStore(NextResponse.redirect(new URL(`/${locale}/${loginTarget}`, request.url)));
  }

  const allowedRoles = protectedSegments[segment as keyof typeof protectedSegments] as readonly string[];

  if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    const fallbackTarget = role.toLowerCase();
    return withNoStore(NextResponse.redirect(new URL(`/${locale}/${fallbackTarget}`, request.url)));
  }

  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: [
    "/:locale/:path*"
  ]
};
