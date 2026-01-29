import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const TOKEN_NAME = "admin_token";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}
