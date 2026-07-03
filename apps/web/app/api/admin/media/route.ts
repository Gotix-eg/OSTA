import { list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

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

async function verifyAdminJwt(token: string): Promise<boolean> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return false;
  }

  try {
    const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedHeader))) as { alg?: string };
    if (header.alg !== "HS256") {
      return false;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me"),
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
      return false;
    }

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as { exp?: number; role?: string };
    const hasExpExpired = payload.exp && payload.exp * 1000 <= Date.now();
    
    return !hasExpExpired && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN");
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("osta_access_token")?.value;
  const isAdmin = token && (await verifyAdminJwt(token));

  if (!isAdmin) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { blobs } = await list();
    return NextResponse.json({ success: true, data: blobs });
  } catch (error) {
    console.error("List media error:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("osta_access_token")?.value;
  const isAdmin = token && (await verifyAdminJwt(token));

  if (!isAdmin) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    await del(url);
    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
