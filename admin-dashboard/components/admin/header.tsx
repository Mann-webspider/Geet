"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminHeader({ email }: { email: string }) {
  async function logout() {
    document.cookie = "admin_token_public=; Path=/; Max-Age=0; SameSite=Lax";
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">Admin Console</div>
      <div className="flex items-center gap-3">
        <div className="text-sm">{email}</div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
