"use client";

import Link from "next/link";
import type { AdminMusicRequestRow } from "@/types";
import { formatDateTime } from "@/lib/utils/date";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SongRequestsTable({ rows }: { rows: AdminMusicRequestRow[] }) {
  console.log(rows);
  
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Song</TableHead>
            <TableHead>Requested by</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Resolved track</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.data.map((r) => {
            const req = r.request;
            const user = r.user;
            const track = r.track;

            return (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-medium">
                    {req.songTitle} — {req.artistName}
                  </div>
                  {req.albumName ? (
                    <div className="text-xs text-muted-foreground">{req.albumName}</div>
                  ) : null}
                </TableCell>

                <TableCell>
                  <div className="font-medium">{user?.username ?? "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email ?? "—"}</div>
                </TableCell>

                <TableCell>
                  <PriorityBadge priority={req.priority} />
                </TableCell>

                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>

                <TableCell className="text-sm">{formatDateTime(req.createdAt)}</TableCell>

                <TableCell className="text-sm">
                  {track ? `${track.title} - ${track.artist}` : "—"}
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/music-request/${req.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No requests found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
