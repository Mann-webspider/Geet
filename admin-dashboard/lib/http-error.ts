"use client";

import axios from "axios";

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    return (
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      err.message ||
      "Request failed"
    );
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}
