"use client";

import { useRouter } from "next/navigation";
import { createArtist } from "@/lib/admin-artist-api";
import type { CreateArtistPayload } from "@/lib/types/artist";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminArtistNewPage() {
  const router = useRouter();
 

  async function handleSubmit(payload: CreateArtistPayload) {
    const result = await createArtist(payload);
    toast.success( "Artist created created successfully." );
    router.push(`/admin/artists/${result.id}`);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Create Artist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Artist details</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtistForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
