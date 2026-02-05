"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEditorialPlaylist, updateEditorialPlaylist } from "@/lib/admin-playlist-api";
import type { EditorialPlaylist, UpdateEditorialPlaylistPayload } from "@/lib/types/playlist";
import { GlobalPlaylistForm } from "@/components/admin/GlobalPlaylistForm";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminGlobalPlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
 

  const id = params?.id;
  const [playlist, setPlaylist] = useState<EditorialPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await getEditorialPlaylist(id);
      setPlaylist(result);
    } catch (e: any) {
      setError(e?.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(payload: UpdateEditorialPlaylistPayload) {
    if (!id) return;
    await updateEditorialPlaylist(id, payload);
     toast.success("Playlist updated");
    load();
  }

  if (loading) return <div className="p-6"><LoadingSkeletonTable /></div>;
  if (error) return <div className="p-6"><ErrorBanner message={error} onRetry={load} /></div>;
  if (!playlist) return <div className="p-6"><ErrorBanner message="Playlist not found" /></div>;

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Manage Playlist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Playlist details</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalPlaylistForm playlist={playlist} onSubmit={handleSubmit} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracks ({playlist.trackCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track management UI coming soon. Use the API endpoint POST /v1/admin/editorial-playlists/{id}/tracks
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
