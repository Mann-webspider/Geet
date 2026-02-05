"use client";

import { useMemo, useState } from "react";
import type { AdminMusicRequest, MusicRequestStatus } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS: MusicRequestStatus[] = [
  "submitted",
  "in_review",
  "in_progress",
  "completed",
  "rejected",
];

export function RequestManageForm({
  request,
  onSaved,
}: {
  request: AdminMusicRequest;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<MusicRequestStatus>(request.status);
  const [adminNote, setAdminNote] = useState<string>(request.adminNote ?? "");
  const [resolvedTrackId, setResolvedTrackId] = useState<string>(request.resolvedTrackId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const validationError = useMemo(() => {
    if (status === "completed" && !resolvedTrackId.trim()) return "resolvedTrackId is required for completed";
    return "";
  }, [status, resolvedTrackId]);

  async function onSubmit() {
    setError("");
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const body: any = {
        status,
        adminNote: adminNote.trim() ? adminNote.trim() : null,
      };

      if (status === "rejected") {
        body.resolvedTrackId = null;
      } else if (resolvedTrackId.trim()) {
        body.resolvedTrackId = resolvedTrackId.trim();
      }

      await adminApi.adminUpdateMusicRequest(request.id, body);
      onSaved();
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function copyText() {
    const album = request.albumName ? ` (${request.albumName})` : "";
    navigator.clipboard.writeText(`${request.songTitle} - ${request.artistName}${album}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as MusicRequestStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Admin note</Label>
        <Textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Optional note (internal or for audit)"
        />
      </div>

      <div className="grid gap-2">
        <Label>Resolved Track ID</Label>
        <Input
          value={resolvedTrackId}
          onChange={(e) => setResolvedTrackId(e.target.value)}
          placeholder="UUID of track (required when completed)"
          disabled={status === "rejected"}
        />
        {status === "completed" ? (
          <p className="text-xs text-muted-foreground">
            Required when you mark completed so the user can open the track.
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" type="button" onClick={copyText}>
          Copy request text
        </Button>

        <Button asChild variant="outline" type="button">
          <a href="/admin/tracks">Open admin tracks</a>
        </Button>

        <Button type="button" onClick={onSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
