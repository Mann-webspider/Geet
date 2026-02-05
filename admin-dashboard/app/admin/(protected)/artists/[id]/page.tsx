"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArtist } from "@/lib/admin-artist-api";
import type { ArtistWithTracks } from "@/types/artist";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { VerifiedBadge } from "@/components/admin/VerifiedBadge";
import { TrackListTable } from "@/components/admin/TrackListTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function AdminArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<ArtistWithTracks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await getArtist(id);
      console.log("artist id ",result.data);
      
      setData(result.data);
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

  if (loading) return <div className="p-6"><LoadingSkeletonTable /></div>;
  if (error) return <div className="p-6"><ErrorBanner message={error} onRetry={load} /></div>;
  if (!data) return <div className="p-6"><ErrorBanner message="Artist not found" /></div>;

  const { artist, tracks } = data;

  return (
    <div className="space-y-4 p-6">
      {artist.bgImageUrl ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image src={artist.bgImageUrl} alt={artist.name} fill className="object-cover" />
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        {artist.imageUrl ? (
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-muted" />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{artist.name}</h1>
            <VerifiedBadge isVerified={artist.isVerified} />
          </div>
          <p className="text-sm text-muted-foreground">/{artist.slug}</p>

          <div className="mt-2 flex gap-2">
            {artist.spotifyUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer">
                  Spotify <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            ) : null}
            {artist.youtubeUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={artist.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  YouTube <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <Button asChild>
          <Link href={`/admin/artists/${artist.id}/edit`}>Edit artist</Link>
        </Button>
      </div>

      {artist.bio ? (
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{artist.bio}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tracks ({tracks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackListTable tracks={tracks} />
        </CardContent>
      </Card>
    </div>
  );
}
