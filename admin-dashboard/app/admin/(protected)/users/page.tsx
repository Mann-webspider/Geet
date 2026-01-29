"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminUserListItem } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { getUserColumns } from "@/components/admin/users-columns";
import { notify } from "@/lib/notify";
import { useConfirmStore } from "@/store/confirm-store";
import { useUrlState } from "@/lib/url-state";

type BannedFilter = "all" | "true" | "false";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const confirm = useConfirmStore((s) => s.ask);
  const { searchParams, setParams } = useUrlState();

  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);
  const banned = (searchParams.get("banned") as BannedFilter) ?? "all";
  const q = searchParams.get("search") ?? "";

  // draft input so typing doesn't feel laggy
  const [draft, setDraft] = useState(q);

  async function load() {
    setLoading(true);
    try {
      const res: any = await adminApi.listUsers({
        limit,
        offset,
        search: q || undefined,
        banned: banned === "all" ? undefined : banned,
      });

      // supports either {status,data:{data,total}} OR {data,total}
      const payload = res?.data?.data ? res.data : res;

      setUsers(payload.data ?? []);
      setTotal(payload.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // load when URL state changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, banned, q]);

  // sync draft when URL changes (back/forward)
  useEffect(() => setDraft(q), [q]);

  // debounce writing draft search -> URL (and reset pagination)
  useEffect(() => {
    const t = setTimeout(() => {
      setParams(
        {
          search: draft || null,
          offset: 0,
        },
        { scroll: false }
      );
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  async function onBan(id: string) {
    confirm(
      {
        title: "Ban user?",
        description: "Are you sure you want to ban this user? This cannot be undone.",
        confirmText: "Ban",
        cancelText: "Cancel",
        destructive: true,
      },
      async () => {
        await adminApi.banUser(id);
        notify.success("User banned");
        await load();
      }
    );
  }

  async function onUnban(id: string) {
    confirm(
      {
        title: "Unban user?",
        description: "Are you sure you want to unban this user?",
        confirmText: "Unban",
        cancelText: "Cancel",
        destructive: false,
      },
      async () => {
        await adminApi.unbanUser(id);
        notify.success("User unbanned");
        await load();
      }
    );
  }

  const columns = useMemo(() => getUserColumns({ onBan, onUnban }), [users]);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Search users and manage bans.</p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          className="max-w-md bg-white"
          placeholder="Search by email or username..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            variant={banned === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ banned: null, offset: 0 }, { scroll: false })}
          >
            All
          </Button>
          <Button
            variant={banned === "false" ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ banned: "false", offset: 0 }, { scroll: false })}
          >
            Not banned
          </Button>
          <Button
            variant={banned === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ banned: "true", offset: 0 }, { scroll: false })}
          >
            Banned
          </Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            disabled={!canPrev || loading}
            onClick={() => setParams({ offset: Math.max(0, offset - limit) }, { scroll: false })}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={!canNext || loading}
            onClick={() => setParams({ offset: offset + limit }, { scroll: false })}
          >
            Next
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          Loading users...
        </div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}

      <div className="text-xs text-muted-foreground">
        Showing {total === 0 ? 0 : Math.min(total, offset + 1)} - {Math.min(total, offset + limit)} of {total}
      </div>
    </div>
  );
}
