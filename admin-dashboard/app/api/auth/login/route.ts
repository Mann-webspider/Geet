import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_NAME = "admin_token";

export async function POST(req: NextRequest) {
    
  const body = await req.json();

  // Call Bun backend login
  const upstream = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => null);
  
  if (!upstream.ok) {
      return NextResponse.json(
      { error: data?.error ?? data?.message ?? "Login failed" },
      { status: upstream.status }
    );
  }
  
  console.log("route login- data", data);
  // Your backend shape:
  // { status: "success", data: { id, email, username, token, isAdmin } }
  const token = data?.data?.token as string | undefined;
  const isAdmin = data?.data?.isAdmin as boolean | undefined;

  if (!token) {
    return NextResponse.json({ error: "Missing token in login response" }, { status: 500 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

//   localStorage.setItem("admin_token", token);

  // Set HttpOnly cookie (server-side, correct place)
  const jar = await cookies();
  jar.set(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  // Return user info (no token needed on client)
  return NextResponse.json({
    user: {
      id: data.data.id,
      email: data.data.email,
      username: data.data.username,
      isAdmin: data.data.isAdmin,
      token: token,
    },
  });
}
