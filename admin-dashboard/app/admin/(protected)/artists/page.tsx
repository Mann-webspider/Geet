"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listArtists } from "@/lib/admin-artist-api";
import type { Artist } from "@/types/artist";
import { ArtistsTable } from "@/components/admin/ArtistsTable";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listArtists({ search, limit: 100 });
      console.log("artist index",data);
      
      setArtists(data.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load artists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Artists</h1>
          <p className="text-sm text-muted-foreground">Manage artist profiles</p>
        </div>
        <Button asChild>
          <Link href="/admin/artists/new">Create artist</Link>
        </Button>
      </div>

      <Input
        placeholder="Search artists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {loading ? <LoadingSkeletonTable /> : <ArtistsTable artists={artists} />}
    </div>
  );
}
