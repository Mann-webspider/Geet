"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AdminMusicRequestRow } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriorityBadge } from "@/components/admin/PriorityBadge";
import { RequestManageForm } from "@/components/admin/RequestManageForm";
import { formatDateTime } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMusicRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [row, setRow] = useState<AdminMusicRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.adminGetMusicRequest(id);
      setRow(data.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="p-6">
        <ErrorBanner message="Request not found" />
      </div>
    );
  }

  const req = row.request;
  const user = row.user;
  const track = row.track;

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Request</h1>
        <p className="text-sm text-muted-foreground">ID: {req.id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Song</div>
              <div>
                {req.songTitle} — {req.artistName}
              </div>
              {req.albumName ? <div className="text-muted-foreground">{req.albumName}</div> : null}
            </div>

            {req.notes ? (
              <div>
                <div className="font-medium">Notes</div>
                <div className="text-muted-foreground whitespace-pre-wrap">{req.notes}</div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={req.priority} />
              <StatusBadge status={req.status} />
            </div>

            <div>
              <div className="font-medium">Requested by</div>
              <div>{user?.username ?? "Unknown"}</div>
              <div className="text-muted-foreground">{user?.email ?? "—"}</div>
              <div className="text-muted-foreground">userId: {req.userId}</div>
            </div>

            <div className="grid gap-1">
              <div>Created: {formatDateTime(req.createdAt)}</div>
              <div>Updated: {formatDateTime(req.updatedAt)}</div>
              <div>Resolved: {formatDateTime(req.resolvedAt)}</div>
            </div>

            <div>
              <div className="font-medium">Resolved track</div>
              <div className="text-muted-foreground">
                {req.resolvedTrackId ? `resolvedTrackId: ${req.resolvedTrackId}` : "Not linked"}
              </div>
              <div className="text-muted-foreground">
                {track ? `${track.title} - ${track.artist} (${track.id})` : "—"}
              </div>
            </div>

            {req.adminNote ? (
              <div>
                <div className="font-medium">Admin note</div>
                <div className="text-muted-foreground whitespace-pre-wrap">{req.adminNote}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestManageForm request={req} onSaved={load} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
