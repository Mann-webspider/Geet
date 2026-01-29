"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor: attach Authorization
adminAxios.interceptors.request.use(
  (config) => {
    let token: string | null = null;

    // Option A: from localStorage
    if (typeof window !== "undefined") {
      token = localStorage.getItem("admin_token");
    }

    // Option B: from cookie (if you prefer)
    // if (!token && typeof document !== "undefined") {
    //   const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
    //   token = match ? decodeURIComponent(match[1]) : null;
    // }
    console.log("axios admin ",token);
    
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401/403
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Clear client token
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        document.cookie = "admin_token=; Path=/; Max-Age=0; SameSite=Lax";
        // tell backend to clear HttpOnly cookie if you have logout route
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);
