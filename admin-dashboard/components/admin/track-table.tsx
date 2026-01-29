"use client";

import type { Track } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

function mmss(seconds: number) {
  const s = Math.max(0, seconds || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function TrackTable({
  tracks,
  onDelete,
}: {
  tracks: Track[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Artist</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">Explicit</th>
              <th className="px-4 py-3 font-medium">Plays</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3">{t.artist}</td>
                <td className="px-4 py-3 tabular-nums">{mmss(t.duration)}</td>
                <td className="px-4 py-3">{t.genre ?? "-"}</td>
                <td className="px-4 py-3">
                  {t.isExplicit ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                </td>
                <td className="px-4 py-3 tabular-nums">{t.playCount}</td>
                <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/tracks?view=${t.id}`}>View</Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete track?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this track? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(t.id)}>
                          Confirm delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
