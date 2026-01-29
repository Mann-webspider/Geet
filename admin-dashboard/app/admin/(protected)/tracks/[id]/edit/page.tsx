"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import type { Track } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

export default function EditTrackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [coverArtUrl, setCoverArtUrl] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminApi.getTrack(id); // GET /v1/tracks/:id
      const t = (res?.data ?? res) as Track;
      setTrack(t);

      setTitle(t.title ?? "");
      setArtist(t.artist ?? "");
      setAlbum(t.album ?? "");
      setGenre(t.genre ?? "");
      setDuration(t.duration != null ? String(t.duration) : "");
      setIsExplicit(!!t.isExplicit);
      setCoverArtUrl(t.coverArtUrl ?? "");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!track) return;

    setSaving(true);
    setError(null);

    try {
      // Build PATCH body with only editable fields
      const body: any = {
        title: title || null,
        artist: artist || null,
        album: album || null,
        genre: genre || null,
        duration: duration ? Number(duration) : null,
        isExplicit,
        coverArtUrl: coverArtUrl || null,
      };

      await adminApi.updateTrack(id, body); // PATCH /v1/tracks/:id

      notify.success("Track updated", "Changes saved successfully.");
      router.push(`/admin/tracks/${id}`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

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
          <h1 className="text-2xl font-semibold tracking-tight">Edit track</h1>
          <p className="text-sm text-muted-foreground">
            {track.title} — {track.artist}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/tracks/${id}`)}>
          Cancel
        </Button>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Track metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Artist</Label>
                <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Album</Label>
                <Input value={album} onChange={(e) => setAlbum(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cover art URL</Label>
                <Input
                  placeholder="https://..."
                  value={coverArtUrl}
                  onChange={(e) => setCoverArtUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Explicit</div>
                <div className="text-xs text-muted-foreground">
                  Mark content as explicit.
                </div>
              </div>
              <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
