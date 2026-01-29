import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  const user = await verifyAdminSession();
  if (!user) return new Response(null, { status: 401 });
  return NextResponse.json({ user });
}
