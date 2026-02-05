"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type { Track } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TrackPlayerWide } from "@/components/admin/track-player-wide";
import { ArtistPickerDialog } from "@/components/admin/ArtistPickerDialog";
import { toast } from "sonner";



function mmss(seconds?: number) {
  const s = Math.max(0, seconds || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function TrackDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  
  const [assigningTrackId, setAssigningTrackId] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // assuming adminApi.getTrack wraps GET /v1/tracks/:id
      const res: any = await adminApi.getTrack(id);
      const payload = res?.data ?? res;
      setTrack(payload as Track);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load track");
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
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        Loading track...
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-6 text-sm text-destructive">
          {error ?? "Track not found."}
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/tracks")}>
          Back to Tracks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{track.title}</h1>
          <p className="text-sm text-muted-foreground">
            {track.artist}
            {track.album ? ` • ${track.album}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/tracks")}>
            Back to Tracks
          </Button>
          <Button onClick={() => router.push(`/admin/tracks/${track.id}/edit`)}>
            Edit Track
          </Button>
           <Button
  variant="outline"
  size="sm"
  onClick={() => setAssigningTrackId(track.id)}
>
  Assign artist
</Button>
{track.artistId ? (
  <Button
    variant="ghost"
    size="sm"
    className="text-red-600"
    onClick={async () => {
      try {
        await adminApi.deassignTrackArtist(track.id);
        toast.success("Artist removed from track");
        load(); // refresh list
      } catch (e: any) {
        toast.error(e?.message || "Failed to remove artist");
      }
    }}
  >
    Remove artist
  </Button>
) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[480px_2fr]">
        {/* Left: cover + player */}
        <Card className="shadow-none ">
          <CardContent className="p-4 space-y-4">
            {track.coverArtUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <Image
                src={track.coverArtUrl}
                alt={track.title}
                width={280}
                height={280}
                unoptimized
                className="w-full rounded-md border object-cover aspect-square"
              />
            ) : (
              <div className="w-full rounded-md border bg-muted/40 aspect-square" />
            )}

            {track.fileUrl && (
  <TrackPlayerWide
    src={track.fileUrl}
    title={track.title}
    artist={track.artist}
  />
)}




          </CardContent>
        </Card>

        {/* Right: metadata */}
        <Card className="shadow-none ">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title</span>
              <span className="font-medium max-w-[260px] text-right truncate">
                {track.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Artist</span>
              <span className="max-w-[260px] text-right truncate">{track.artist}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Album</span>
              <span className="max-w-[260px] text-right truncate">
                {track.album ?? "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Genre</span>
              <span>{track.genre ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="tabular-nums">{mmss(track.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Explicit</span>
              <span>
                {track.isExplicit ? (
                  <Badge variant="destructive">Explicit</Badge>
                ) : (
                  <Badge variant="secondary">Clean</Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Play count</span>
              <span className="tabular-nums">{track.playCount ?? 0}</span>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {track.createdAt ? new Date(track.createdAt).toLocaleString() : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>
                  {track.updatedAt ? new Date(track.updatedAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ArtistPickerDialog
  open={!!assigningTrackId}
  trackId={assigningTrackId}
  onClose={() => setAssigningTrackId(null)}
  onAssigned={load} // your existing function to refresh track list
/>
    </div>
  );
}
