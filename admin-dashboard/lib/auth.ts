import axios from "axios";
import { cookies } from "next/headers";
import type { User } from "@/types";

const TOKEN_NAME = "admin_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const serverAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

export async function getAuthToken() {
  const jar = await cookies();
  return jar.get(TOKEN_NAME)?.value ?? null;
}

export async function verifyAdminSession(): Promise<User | null> {
  const token = await getAuthToken();
  console.log("verifyAdminSession token?", token ? "present" : "missing");

  if (!token) {
    console.log("[verifyAdminSession] no cookie");
    return null;
  }

  try {
    const res = await serverAxios.get("/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // your backend shape: { status:"success", data:{...} }
    const payload = res.data;

    if (payload?.status !== "success" || !payload?.data) {
      console.log("[verifyAdminSession] unexpected /me payload", payload);
      return null;
    }

    const user: User = {
      id: payload.data.id,
      email: payload.data.email,
      username: payload.data.username,
      isAdmin: payload.data.isAdmin,
    };

    if (!user.isAdmin) {
      console.log("[verifyAdminSession] not admin");
      return null;
    }

    return user;
  } catch (e: any) {
    const status = e?.response?.status;
    console.log("[verifyAdminSession] /v1/auth/me failed", status ?? e?.message ?? e);
    return null;
  }
}
