"use client";

import type { IngestionJobListItem, IngestionJobStatus } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function shortId(id?: string) {
  if (!id) return "";
  return id.slice(0, 8);
}


function statusBadge(status: IngestionJobStatus) {
  switch (status) {
    case "pending": return <Badge variant="secondary">Pending</Badge>;
    case "downloading": return <Badge className="bg-blue-600">Downloading</Badge>;
    case "transcoding": return <Badge className="bg-purple-600">Transcoding</Badge>;
    case "completed": return <Badge className="bg-emerald-600">Completed</Badge>;
    case "failed": return <Badge variant="destructive">Failed</Badge>;
  }
}

export function IngestionJobsTable({
  jobs,
  onRetry,
  onDelete,
}: {
  jobs: IngestionJobListItem[];
  onRetry: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Input</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Retries</th>
              <th className="px-4 py-3 font-medium">Error</th>
              <th className="px-4 py-3 font-medium">Requested by</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.job.id} className="border-t">
                <td className="px-4 py-3 font-medium">{shortId(j.job.id)}</td>
                <td className="px-4 py-3">{j.job.sourceType}</td>
                <td className="px-4 py-3 max-w-[360px] truncate" title={j.job.sourceInput}>
                  {j.job.sourceInput}
                </td>
                <td className="px-4 py-3">{statusBadge(j.job.status)}</td>
                <td className="px-4 py-3 tabular-nums">{j.job.retryCount}</td>
                <td className="px-4 py-3">{j.job.errorCode ?? "-"}</td>
                <td className="px-4 py-3">{j.job.requestedBy?.email ?? "-"}</td>
                <td className="px-4 py-3">{new Date(j.job.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/ingestion-jobs/${j.job.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={j.job.status !== "failed"}
                    onClick={() => onRetry(j.job.id)}
                  >
                    Retry
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(j.job.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
