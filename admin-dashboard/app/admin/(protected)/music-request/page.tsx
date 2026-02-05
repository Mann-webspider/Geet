"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminMusicRequestRow, MusicRequestStatus } from "@/lib/types";
import { adminApi } from "@/lib/admin-api";
import { SongRequestsTable } from "@/components/admin/SongRequestsTable";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_LIMIT = 20;

const tabs: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "In review", value: "in_review" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminMusicRequestsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const statusParam = (sp.get("status") || "all") as string;
  const limit = Number(sp.get("limit") || DEFAULT_LIMIT);
  const offset = Number(sp.get("offset") || 0);

  const [rows, setRows] = useState<AdminMusicRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  const status = useMemo(() => {
    if (statusParam === "all") return undefined;
    return statusParam as MusicRequestStatus;
  }, [statusParam]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.adminListMusicRequests({ status, limit, offset });
      setRows(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, limit, offset]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const req = r.request;
      const user = r.user;
      return (
        req.songTitle.toLowerCase().includes(term) ||
        req.artistName.toLowerCase().includes(term) ||
        (req.albumName ?? "").toLowerCase().includes(term) ||
        (user?.username ?? "").toLowerCase().includes(term) ||
        (user?.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, q]);

  function setQueryParams(next: Record<string, string>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) p.delete(k);
      else p.set(k, v);
    });
    router.push(`/admin/music-request?${p.toString()}`);
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">User Song Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review user requests and mark them completed/rejected. When you update status to completed, the user will receive an in-app notification.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={statusParam}
          onValueChange={(v) => setQueryParams({ status: v === "all" ? "" : v, offset: "0" })}
        >
          <TabsList className="flex flex-wrap">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Input
          className="md:w-[320px]"
          placeholder="Search song/user..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error ? <ErrorBanner message={error} onRetry={load} /> : null}

      {loading ? <LoadingSkeletonTable /> : <SongRequestsTable rows={filtered} />}

      <PaginationControls
        limit={limit}
        offset={offset}
        count={rows.length}
        onChange={(n) => setQueryParams({ limit: String(n.limit), offset: String(n.offset) })}
      />
    </div>
  );
}
