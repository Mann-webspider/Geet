"use client";

import type {
  Track,
  IngestionJobListItem,
  IngestionJobDetails,
  DashboardStats,
  AdminUserListItem,
  PaginatedResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)admin_token_public=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function clearAuthAndRedirect() {
  // clear public token cookie
  document.cookie =
    "admin_token_public=; Path=/; Max-Age=0; SameSite=Lax";
  // also clear server cookie
  fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  window.location.href = "/admin/login";
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthAndRedirect();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (null as unknown) as T;
}

export const adminApi = {
  // Tracks
  listTracks: (params: { limit: number; offset: number; search?: string }) => {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.search) q.set("search", params.search);
    return request<PaginatedResponse<Track>>(`/v1/admin/tracks?${q.toString()}`);
  },

  uploadTrack: (formData: FormData) =>
    request<Track>("/v1/admin/tracks", { method: "POST", body: formData }),

  deleteTrack: (id: string) =>
    request<{ ok: boolean }>(`/v1/admin/tracks/${id}`, { method: "DELETE" }),

  // Ingestion jobs
  listJobs: (params: { limit: number; offset: number; status?: string }) => {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.status && params.status !== "all") q.set("status", params.status);
    return request<PaginatedResponse<IngestionJobListItem>>(
      `/v1/admin/ingestion-jobs?${q.toString()}`
    );
  },

  createJob: (body: { sourceType: "youtube" | "torrent" | "manual"; sourceInput: string }) =>
    request<{ id: string }>(`/v1/admin/ingestion-jobs`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  jobDetails: (id: string) =>
    request<IngestionJobDetails>(`/v1/admin/ingestion-jobs/${id}`),

  retryJob: (id: string) =>
    request<{ ok: boolean }>(`/v1/admin/ingestion-jobs/${id}/retry`, { method: "POST" }),

  deleteJob: (id: string) =>
    request<{ ok: boolean }>(`/v1/admin/ingestion-jobs/${id}`, { method: "DELETE" }),

  // Dashboard / users (later)
  dashboardStats: () => request<DashboardStats>(`/v1/admin/dashboard/stats`),

  listUsers: (params: { limit: number; offset: number; search?: string; banned?: "true" | "false" }) => {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.search) q.set("search", params.search);
    if (params.banned) q.set("banned", params.banned);
    return request<PaginatedResponse<AdminUserListItem>>(`/v1/admin/users?${q.toString()}`);
  },
};
