"use client";

import { useRouter } from "next/navigation";
import { createEditorialPlaylist } from "@/lib/admin-playlist-api";
import type { CreateEditorialPlaylistPayload } from "@/lib/types/playlist";
import { GlobalPlaylistForm } from "@/components/admin/GlobalPlaylistForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminGlobalPlaylistNewPage() {
  const router = useRouter();
  

  async function handleSubmit(payload: CreateEditorialPlaylistPayload) {
    const result = await createEditorialPlaylist(payload);

     toast.success("Playlist created Successfully");
    router.push(`/admin/global-playlists/${result.id}`);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Create Global Playlist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Playlist details</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalPlaylistForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
