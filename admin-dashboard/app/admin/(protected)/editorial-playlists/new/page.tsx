"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorialPlaylistForm } from "@/components/admin/editorial/editorial-playlist-form";
import { createEditorialPlaylist } from "@/lib/admin-editorial-api";
import { toast } from "sonner";

export default function NewEditorialPlaylistPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: any) {
    setSubmitting(true);
    try {
      const res = await createEditorialPlaylist(values);
      toast.success("Playlist created");
      router.push(`/admin/editorial-playlists/${res.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create playlist");
      throw e;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New editorial playlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a curated playlist for the home feed.
        </p>
      </div>

      <EditorialPlaylistForm
        initial={{
          name: "",
          description: "",
          coverArtUrl: "",
          visibleOnHome: true,
          priority: 0,
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
