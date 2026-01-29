"use client";

import Link from "next/link";
import type { Track } from "@/types";
import { Button } from "@/components/ui/button";

export function RecentTracks({ tracks }: { tracks: Track[] }) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <div className="text-sm font-medium">Recent tracks</div>
          <div className="text-xs text-muted-foreground">Last 5 uploads</div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tracks">View all</Link>
        </Button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Artist</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-5 py-3 font-medium max-w-[420px] truncate" title={t.title}>
                  {t.title}
                </td>
                <td className="px-5 py-3">{t.artist}</td>
                <td className="px-5 py-3">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {tracks.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={3}>
                  No tracks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
