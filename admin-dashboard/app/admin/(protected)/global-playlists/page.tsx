"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listEditorialPlaylists, refreshTrending } from "@/lib/admin-playlist-api";
import type { EditorialPlaylist } from "@/types";
import { GlobalPlaylistsTable } from "@/components/admin/GlobalPlaylistsTable";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { LoadingSkeletonTable } from "@/components/admin/LoadingSkeletonTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminGlobalPlaylistsPage() {
 
  const [playlists, setPlaylists] = useState<EditorialPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listEditorialPlaylists();
      setPlaylists(data.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshTrending() {
    setRefreshing(true);
    try {
      await refreshTrending();
      toast.success("Trending playlist updated.");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to refresh trending playlist");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Global Playlists</h1>
          <p className="text-sm text-muted-foreground">Manage editorial and curated playlists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshTrending} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh trending"}
          </Button>
          <Button asChild>
            <Link href="/admin/global-playlists/new">Create playlist</Link>
          </Button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {loading ? <LoadingSkeletonTable /> : <GlobalPlaylistsTable playlists={playlists} />}
    </div>
  );
}
