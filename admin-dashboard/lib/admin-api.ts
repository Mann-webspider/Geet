"use client";

import { adminAxios } from "./axios.admin";
import type {
  Track,
  IngestionJobListItem,
  IngestionJobDetails,
  DashboardStats,
  AdminUserListItem,
  PaginatedResponse,
} from "@/types";

export const adminApi = {
  // Tracks
  async listTracks(params: { limit: number; offset: number; search?: string }) {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.search) q.set("search", params.search);
    const res = await adminAxios.get<PaginatedResponse<Track>>(
      `/v1/admin/tracks?${q.toString()}`
    );
    return res.data;
  },

  async uploadTrack(formData: FormData) {
    const res = await adminAxios.post<Track>("/v1/admin/tracks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async deleteTrack(id: string) {
    const res = await adminAxios.delete(`/v1/admin/tracks/${id}`);
    return res.data;
  },

  // Ingestion jobs
  async listJobs(params: { limit: number; offset: number; status?: string }) {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.status && params.status !== "all") q.set("status", params.status);
    const res = await adminAxios.get<PaginatedResponse<IngestionJobListItem>>(
      `/v1/admin/ingestion-jobs?${q.toString()}`
    );
    return res.data;
  },

 createJob: async (body: { sourceType: "youtube" | "torrent" | "manual"; sourceInput: string }) => {
  const res = await adminAxios.post(`/v1/admin/ingestion-jobs`, body);
  return res.data.data as { id: string };
},


  async jobDetails(id: string) {
    const res = await adminAxios.get<IngestionJobDetails>(`/v1/admin/ingestion-jobs/${id}`);
    return res.data;
  },

  async retryJob(id: string) {
    const res = await adminAxios.post(`/v1/admin/ingestion-jobs/${id}/retry`);
    return res.data;
  },

  async deleteJob(id: string) {
    const res = await adminAxios.delete(`/v1/admin/ingestion-jobs/${id}`);
    return res.data;
  },



  async listUsers(params: {
    limit: number;
    offset: number;
    search?: string;
    banned?: "true" | "false";
  }) {
    const q = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    });
    if (params.search) q.set("search", params.search);
    if (params.banned) q.set("banned", params.banned);
    const res = await adminAxios.get<PaginatedResponse<AdminUserListItem>>(
      `/v1/admin/users?${q.toString()}`
    );
    return res.data;
  },

  dashboardStats: async () => {
  const res = await adminAxios.get(`/v1/admin/dashboard/stats`);
  return res.data; // backend returns {status:"success", data:{...}} or direct
},

recentJobs: async (limit = 5) => {
  const res = await adminAxios.get(`/v1/admin/ingestion-jobs?limit=${limit}&offset=0`);
  return res.data;
},

recentTracks: async (limit = 5) => {
  const res = await adminAxios.get(`/v1/admin/tracks?limit=${limit}&offset=0`);
  return res.data;
},
banUser: async (id: string) => {
  const res = await adminAxios.post(`/v1/admin/users/${id}/ban`);
  return res.data;
},

unbanUser: async (id: string) => {
  const res = await adminAxios.post(`/v1/admin/users/${id}/unban`);
  return res.data;
},
userDetails: async (id: string) => {
  const res = await adminAxios.get(`/v1/admin/users/${id}`);
  return res.data;
},
// Single track
getTrack: async (id: string) => {
  const res = await adminAxios.get(`/v1/tracks/${id}`); // public/admin both OK since protected by JWT
  return res.data;
},

// Update track
updateTrack: async (id: string, body: Partial<Track>) => {
  const res = await adminAxios.patch(`/v1/tracks/${id}`, body);
  return res.data;
},

};
