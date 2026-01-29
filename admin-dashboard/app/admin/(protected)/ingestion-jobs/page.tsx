"use client";

import { useEffect, useState } from "react";
import type { IngestionJobListItem } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { IngestionJobsTable } from "@/components/admin/ingestion-jobs-table";
import { Button } from "@/components/ui/button";
import { IngestionJobCreateDialog } from "@/components/admin/ingestion-job-create-dialog";
import { notify } from "@/lib/notify";
import { useConfirmStore } from "@/store/confirm-store";
import { useUrlState } from "@/lib/url-state";

const STATUS = ["all", "pending", "downloading", "transcoding", "completed", "failed"] as const;

export default function IngestionJobsPage() {
  const [jobs, setJobs] = useState<IngestionJobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const confirm = useConfirmStore((s) => s.ask);
  const { searchParams, setParams } = useUrlState();

  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);
  const status = (searchParams.get("status") as (typeof STATUS)[number]) ?? "all";

  async function load() {
    setLoading(true);
    try {
      const res: any = await adminApi.listJobs({ limit, offset, status });
      const payload = res?.data?.data ? res.data : res;
      const data: IngestionJobListItem[] = payload.data ?? payload ?? [];
      setJobs(data);
      setTotal(payload.total ?? data.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, status]);

  async function retry(id: string) {
    try {
      await adminApi.retryJob(id);
      notify.success("Job retried");
      await load();
    } catch (e: any) {
      notify.error("Retry failed", e?.message ?? "Unknown error");
    }
  }

  async function del(id: string) {
    confirm(
      {
        title: "Delete Job?",
        description: "Are you sure you want to delete this job? This cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        destructive: true,
      },
      async () => {
        await adminApi.deleteJob(id);
        notify.success("Job deleted");
        await load();
      }
    );
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ingestion Jobs</h1>
          <p className="text-sm text-muted-foreground">Monitor ingestion, retry failures, inspect logs.</p>
        </div>
        <IngestionJobCreateDialog onCreated={load} />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          {STATUS.map((s) => (
            <Button
              key={s}
              variant={status === s ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setParams(
                  {
                    status: s === "all" ? null : s,
                    offset: 0,
                  },
                  { scroll: false }
                )
              }
            >
              {s}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            disabled={!canPrev || loading}
            onClick={() =>
              setParams(
                { offset: Math.max(0, offset - limit), limit },
                { scroll: false }
              )
            }
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={!canNext || loading}
            onClick={() =>
              setParams(
                { offset: offset + limit, limit },
                { scroll: false }
              )
            }
          >
            Next
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          Loading jobs...
        </div>
      ) : (
        <IngestionJobsTable jobs={jobs} onRetry={retry} onDelete={del} />
      )}

      <div className="text-xs text-muted-foreground">
        Showing {total === 0 ? 0 : Math.min(total, offset + 1)} - {Math.min(total, offset + limit)} of {total}
      </div>
    </div>
  );
}
