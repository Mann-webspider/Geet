"use client";

import { toast } from "sonner";

export const notify = {
  success: (title: string, description?: string) =>
    toast.success(title, description ? { description } : undefined),

  error: (title: string, description?: string) =>
    toast.error(title, description ? { description } : undefined),

  info: (title: string, description?: string) =>
    toast(title, description ? { description } : undefined),
};
