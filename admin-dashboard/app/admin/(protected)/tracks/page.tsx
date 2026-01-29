"use client";

import { useEffect, useState } from "react";
import type { Track } from "@/types";
import { adminApi } from "@/lib/admin-api";
import { TrackTable } from "@/components/admin/track-table";
import { TrackUploadDialog } from "@/components/admin/track-upload-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.listTracks({ limit, offset, search });
      setTracks(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(0);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function onDelete(id: string) {
    await adminApi.deleteTrack(id);
    await load();
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracks</h1>
          <p className="text-sm text-muted-foreground">Search, upload, and manage tracks.</p>
        </div>

        <TrackUploadDialog onUploaded={load} />
      </div>

      <div className="flex items-center gap-3">
        <Input
          className="max-w-md bg-white"
          placeholder="Search by title, artist, album..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - limit))}>
            Prev
          </Button>
          <Button variant="outline" disabled={!canNext} onClick={() => setOffset(offset + limit)}>
            Next
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">Loading tracks...</div>
      ) : (
        <TrackTable tracks={tracks} onDelete={onDelete} />
      )}

      <div className="text-xs text-muted-foreground">
        Showing {Math.min(total, offset + 1)} - {Math.min(total, offset + limit)} of {total}
      </div>
    </div>
  );
}
