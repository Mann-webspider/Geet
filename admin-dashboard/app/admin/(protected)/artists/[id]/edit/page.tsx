"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArtist, updateArtist } from "@/lib/admin-artist-api";
import type { Artist, UpdateArtistPayload } from "@/lib/types/artist";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminArtistEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
 

  const id = params?.id;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await getArtist(id);
      setArtist(result.data.artist);
    } catch (e: any) {
      setError(e?.message || "Failed to load artist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(payload: UpdateArtistPayload) {
    if (!id) return;
    await updateArtist(id, payload);
    toast.success("Artist updated successfully");
    router.push(`/admin/artists/${id}`);
  }

  if (loading) return <div className="p-6"><LoadingSkeletonTable /></div>;
  if (error) return <div className="p-6"><ErrorBanner message={error} onRetry={load} /></div>;
  if (!artist) return <div className="p-6"><ErrorBanner message="Artist not found" /></div>;

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Edit Artist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Artist details</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtistForm artist={artist} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
