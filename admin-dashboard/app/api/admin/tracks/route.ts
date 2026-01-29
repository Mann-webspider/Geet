import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return new Response(null, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "20";
  const q = searchParams.get("q") ?? "";

  const url = new URL(`${API_URL}/v1/admin/tracks`);
  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);
  if (q) url.searchParams.set("q", q);

  const upstream = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return new Response(null, { status: 401 });

  const formData = await req.formData();

  const upstream = await fetch(`${API_URL}/v1/admin/tracks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
