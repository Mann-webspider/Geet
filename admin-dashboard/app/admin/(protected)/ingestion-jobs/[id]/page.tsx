"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { IngestionJobDetails } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { JobDetailsView } from "@/components/admin/job-details";
import { useConfirmStore } from "@/store/confirm-store";
import { notify } from "@/lib/notify";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [job, setJob] = useState<IngestionJobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirmStore((s) => s.ask);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.jobDetails(id);
      setJob(res.data.job);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function retry() {
    if (!job || job.status !== "failed") return;
    await adminApi.retryJob(id);
    await load();
  }

  async function del() {
    const ok = confirm("Delete this job?");
    confirm(
    {
      title: "Delete job?",
      description: "Are you sure you want to delete this job? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    },
    async () => {
      await adminApi.deleteJob(id);
      notify.success("Track deleted");
      // refetch list here
      router.push("/admin/ingestion-jobs");
    }
  );
   
  }

  if (loading) return <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">Loading...</div>;
  if (!job) return <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">Not found.</div>;

  return <JobDetailsView job={job} onRetry={retry} onDelete={del} />;
}
