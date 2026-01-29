"use client";

import type { IngestionJobDetails } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function JobDetailsView({
  job,
  onRetry,
  onDelete,
}: {
  job: IngestionJobDetails;
  onRetry: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Job</div>
            <div className="text-lg font-semibold">{job.id}</div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={job.status !== "failed"} onClick={onRetry}>
              Retry
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{job.sourceType}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span><Badge>{job.status}</Badge></span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Retry count</span><span>{job.retryCount}</span></div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Source input</div>
            <div className="rounded-md bg-muted/40 p-3 break-words">{job.sourceInput}</div>
          </div>
        </div>
      </div>

      {(job.extractedTitle || job.extractedArtist || job.extractedThumbnail) && (
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm font-medium">Extracted metadata</div>
          <div className="mt-3 grid md:grid-cols-[120px_1fr] gap-4">
            {job.extractedThumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.extractedThumbnail}
                alt="thumbnail"
                className="h-28 w-28 rounded-md object-cover border"
              />
            ) : (
              <div className="h-28 w-28 rounded-md border bg-muted/40" />
            )}

            <div className="text-sm space-y-2">
              <div><span className="text-muted-foreground">Title:</span> {job.extractedTitle ?? "-"}</div>
              <div><span className="text-muted-foreground">Artist:</span> {job.extractedArtist ?? "-"}</div>
              <div><span className="text-muted-foreground">Duration:</span> {job.extractedDuration ?? "-"}s</div>
            </div>
          </div>
        </div>
      )}

      {job.trackId && (
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm font-medium">Result track</div>
          <div className="mt-2 text-sm">
            <Link className="underline" href={`/admin/tracks?view=${job.trackId}`}>
              View track ({job.trackId})
            </Link>
          </div>
        </div>
      )}

      {job.status === "failed" && (
        <div className="rounded-lg border bg-white p-5 space-y-3">
          <div className="text-sm font-medium">Error details</div>
          <div className="text-sm"><span className="text-muted-foreground">Code:</span> {job.errorCode ?? "-"}</div>
          <div className="text-sm"><span className="text-muted-foreground">Message:</span> {job.errorMessage ?? "-"}</div>
          {job.debugLog && (
            <details className="rounded-md border bg-muted/30 p-3">
              <summary className="cursor-pointer text-sm font-medium">Debug log</summary>
              <pre className="mt-3 max-h-72 overflow-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                {job.debugLog}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
