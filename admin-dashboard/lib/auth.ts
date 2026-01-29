import { cookies } from "next/headers";
import type { User } from "@/types";

const TOKEN_NAME = "admin_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getAuthToken() {
  const jar = await cookies();
  return jar.get(TOKEN_NAME)?.value ?? null;
}

export async function verifyAdminSession(): Promise<User | null> {
  const token = await getAuthToken();
  console.log(token);
  
  if (!token) {
    console.log("[verifyAdminSession] no cookie");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    
    if (!res.ok) {
        console.log("[verifyAdminSession] /v1/auth/me failed", res.status);
        return null;
    }
    
    const data = await res.json(); // assume backend returns the user object
    console.log(data);
    const user: User = {
      id: data.data.id,
      email: data.data.email,
      username: data.data.username,
      isAdmin: data.data.isAdmin,
    };

    if (!user.isAdmin) {
      console.log("[verifyAdminSession] not admin");
      return null;
    }

    return user;
  } catch (e) {
    console.log("[verifyAdminSession] error", e);
    return null;
  }
}
