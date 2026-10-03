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

  let blobs: any[] = [];
  try {
    const listRes = await list();
    blobs = listRes.blobs || [];
  } catch (err) {
    console.warn("Vercel Blob list notice:", err);
  }

  let folders = {
    workers: [],
    clients: [],
    vendors: [],
    system: [],
    avatars: []
  };

  try {
    const serverUrl = process.env.NEXT_PUBLIC_OSTA_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${serverUrl}/admin/media/folders`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        folders = json.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch entity media folders from server:", err);
  }

  return NextResponse.json({
    success: true,
    data: blobs,
    folders
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("osta_access_token")?.value;
  const isAdmin = token && (await verifyAdminJwt(token));

  if (!isAdmin) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "cleanup-orphans") {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_OSTA_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${serverUrl}/admin/media/cleanup-orphans`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      return NextResponse.json(data);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Failed to cleanup orphans" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("osta_access_token")?.value;
  const isAdmin = token && (await verifyAdminJwt(token));

  if (!isAdmin) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // query params might be used
  }

  const entityType = body.entityType || searchParams.get("entityType");
  const entityId = body.entityId || searchParams.get("entityId");
  const field = body.field || searchParams.get("field");

  if (entityType && entityId) {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_OSTA_API_URL || "http://localhost:5000/api";
      await fetch(`${serverUrl}/admin/media/entity-file`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ entityType, entityId, field, fileUrl: url })
      });
    } catch (e) {
      console.error("Failed to clear entity document on server:", e);
    }
  }

  if (url) {
    try {
      await del(url);
    } catch (error) {
      console.warn("Delete blob notice:", error);
    }
  }

  return NextResponse.json({ success: true, message: "Media deleted successfully" });
}
