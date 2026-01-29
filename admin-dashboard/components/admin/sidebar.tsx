"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Music2, Cpu, Users } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tracks", href: "/admin/tracks", icon: Music2 },
  { label: "Ingestion Jobs", href: "/admin/ingestion-jobs", icon: Cpu },
  { label: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="px-6 py-5">
        <div className="text-lg font-semibold tracking-tight">Admin</div>
        <div className="text-xs text-muted-foreground">Music Platform</div>
      </div>

      <nav className="px-3 pb-4 space-y-1">
        {nav.map((item) => {
          const active = path === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
