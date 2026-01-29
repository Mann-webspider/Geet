"use client";

import Link from "next/link";
import type { IngestionJobListItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function shortId(id?: string) {
  if (!id) return "-";
  return id.slice(0, 8);
}

function statusBadge(status?: string) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "downloading":
      return <Badge className="bg-blue-600">Downloading</Badge>;
    case "transcoding":
      return <Badge className="bg-purple-600">Transcoding</Badge>;
    case "completed":
      return <Badge className="bg-emerald-600">Completed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function RecentJobs({ jobs }: { jobs: IngestionJobListItem[] }) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <div className="text-sm font-medium">Recent ingestion jobs</div>
          <div className="text-xs text-muted-foreground">Last 5 jobs</div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/ingestion-jobs">View all</Link>
        </Button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.job.id} className="border-t">
                <td className="px-5 py-3 font-medium tabular-nums">{shortId(j.job.id)}</td>
                <td className="px-5 py-3">{j.job.sourceType}</td>
                <td className="px-5 py-3">{statusBadge(j.job.status)}</td>
                <td className="px-5 py-3">{new Date(j.job.createdAt).toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/ingestion-jobs/${j.job.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={5}>
                  No jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
