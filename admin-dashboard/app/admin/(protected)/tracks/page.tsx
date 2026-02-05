"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Track } from "@/types";
import { TrackTable } from "@/components/admin/track-table";
import { TrackUploadDialog } from "@/components/admin/track-upload-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/lib/url-state";
import { ArtistPickerDialog } from "@/components/admin/ArtistPickerDialog";

export default function TracksPage() {
  const { searchParams, setParams } = useUrlState();

  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);
  const q = searchParams.get("search") ?? "";

  // keep a draft input so typing is smooth
  const [draft, setDraft] = useState(q);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);


  async function load() {
    setLoading(true);
    try {
      const res: any = await adminApi.listTracks({ limit, offset, search: q || undefined });
      const paged = res?.data?.data ? res.data : res; // supports {status,data:{...}} or {data,total}
      setTracks(paged.data ?? paged ?? []);
      setTotal(paged.total ?? (paged.data?.length ?? 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, q]);

  // keep draft synced if URL changes (back/forward)
  useEffect(() => setDraft(q), [q]);

  // debounce: update URL (and reset offset) when typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      setParams({ search: draft || null, offset: 0 }, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

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
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            disabled={!canPrev || loading}
            onClick={() => setParams({ offset: Math.max(0, offset - limit) })}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={!canNext || loading}
            onClick={() => setParams({ offset: offset + limit })}
          >
            Next
          </Button>
         

        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">Loading tracks...</div>
      ) : (
        <TrackTable tracks={tracks} onDelete={async (id) => { await adminApi.deleteTrack(id); await load(); }} />
      )}
      

    </div>
  );
}
