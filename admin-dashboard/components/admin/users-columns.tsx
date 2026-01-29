"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUserListItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export function getUserColumns(opts: {
  onBan: (id: string) => Promise<void>;
  onUnban: (id: string) => Promise<void>;
}): ColumnDef<AdminUserListItem>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="font-medium">{row.original.email}</div>,
    },
    { accessorKey: "username", header: "Username" },
    {
      accessorKey: "isAdmin",
      header: "Admin",
      cell: ({ row }) =>
        row.original.isAdmin ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>,
    },
    {
      accessorKey: "isPremium",
      header: "Premium",
      cell: ({ row }) =>
        row.original.isPremium ? <Badge className="bg-emerald-600">Yes</Badge> : <Badge variant="secondary">No</Badge>,
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.isVerified ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>,
    },
    {
      accessorKey: "isBanned",
      header: "Banned",
      cell: ({ row }) =>
        row.original.isBanned ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>,
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last active",
      cell: ({ row }) => {
        const v = row.original.lastActiveAt;
        return <span className="text-muted-foreground">{v ? new Date(v).toLocaleString() : "-"}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-muted-foreground">{new Date(row.original.createdAt).toLocaleString()}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" asChild>
  <Link href={`/admin/users/${u.id}`}>View</Link>
</Button>
            {u.isBanned ? (
              <Button size="sm" variant="outline" onClick={() => opts.onUnban(u.id)}>
                Unban
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => opts.onBan(u.id)}>
                Ban
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
