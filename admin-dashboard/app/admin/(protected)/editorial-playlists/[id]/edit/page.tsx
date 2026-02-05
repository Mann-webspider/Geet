"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEditorialPlaylistById,
  updateEditorialPlaylist,
  type EditorialPlaylist,
} from "@/lib/admin-editorial-api";
import { EditorialPlaylistForm } from "@/components/admin/editorial/editorial-playlist-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditEditorialPlaylistPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [playlist, setPlaylist] = useState<EditorialPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getEditorialPlaylistById(id);
        setPlaylist(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load playlist");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(values: any) {
    setSubmitting(true);
    try {
      await updateEditorialPlaylist(id, values);
      toast.success("Playlist updated");
      router.push(`/admin/editorial-playlists/${id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update playlist");
      throw e;
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !playlist) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-sm text-destructive">
          {error ?? "Playlist not found"}
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/editorial-playlists")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit playlist
          </h1>
          <p className="text-sm text-muted-foreground">{playlist.name}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/editorial-playlists/${id}`)}
        >
          Back to playlist
        </Button>
      </div>

      <EditorialPlaylistForm
        initial={{
          name: playlist.name,
          description: playlist.description ?? "",
          coverArtUrl: playlist.coverArtUrl ?? "",
          visibleOnHome: playlist.visibleOnHome,
          priority: playlist.priority,
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
