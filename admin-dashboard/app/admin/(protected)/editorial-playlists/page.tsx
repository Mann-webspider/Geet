"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getEditorialPlaylists,
  refreshTrendingPlaylist,
  type EditorialPlaylist,
} from "@/lib/admin-editorial-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EditorialPlaylistsPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<EditorialPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshOpen, setRefreshOpen] = useState(false);
  const [windowHours, setWindowHours] = useState(24);
  const [limit, setLimit] = useState(50);
  const trending = useMemo(
    () => playlists.find((p) => p.editorialType === "trending") || null,
    [playlists]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getEditorialPlaylists();
        setPlaylists(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load editorial playlists");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRefreshTrending() {
    try {
      const res = await refreshTrendingPlaylist({ windowHours, limit });
      toast.success("Trending playlist updated.");
      setRefreshOpen(false);
      const data = await getEditorialPlaylists();
      setPlaylists(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to refresh trending playlist");
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-sm text-destructive">{error}</div>
        <Button variant="outline" onClick={() => location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editorial Playlists
          </h1>
          <p className="text-sm text-muted-foreground">
            Home-curated and trending playlists powering the user home feed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/editorial-playlists/new")}>
            Create playlist
          </Button>

          {trending ? (
            <Button
              variant="outline"
              onClick={() => setRefreshOpen(true)}
            >
              Refresh Trending Now
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await refreshTrendingPlaylist();
                  toast.success(
                    `Created/updated Trending Now with ${res.trackCount} tracks`
                  );
                  const data = await getEditorialPlaylists();
                  setPlaylists(data);
                } catch (e: any) {
                  toast.error(
                    e?.message ?? "Failed to create trending playlist"
                  );
                }
              }}
            >
              Create/Refresh Trending Now
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Visible on home</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Updated at</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                {p.name}
                {p.editorialType === "trending" && (
                  <Badge className="ml-2" variant="outline">
                    Trending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {p.editorialType === "home_curated"
                  ? "Home curated"
                  : p.editorialType === "trending"
                  ? "Trending"
                  : "-"}
              </TableCell>
              <TableCell>
                {p.visibleOnHome ? (
                  <Badge variant="outline">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>
              <TableCell>{p.priority}</TableCell>
              <TableCell>
                {new Date(p.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/editorial-playlists/${p.id}`)
                  }
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/editorial-playlists/${p.id}/edit`)
                  }
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={refreshOpen} onOpenChange={setRefreshOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh Trending Now</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Window hours</Label>
              <Input
                type="number"
                value={windowHours}
                onChange={(e) => setWindowHours(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Limit</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefreshOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefreshTrending}>Refresh</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
