import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return new Response(null, { status: 401 });

  const { id } = await ctx.params;

  const upstream = await fetch(`${API_URL}/v1/admin/tracks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
