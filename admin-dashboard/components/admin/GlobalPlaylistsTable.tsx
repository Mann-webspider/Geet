"use client";

import Link from "next/link";
import type { EditorialPlaylist } from "@/lib/types/playlist";
import { formatDateTime } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GlobalPlaylistsTable({ playlists }: { playlists: EditorialPlaylist[] }) {
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tracks</TableHead>
            <TableHead>Home</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{p.editorialType ?? "custom"}</Badge>
              </TableCell>
              <TableCell>{p.trackCount}</TableCell>
              <TableCell>
                {p.visibleOnHome ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}
              </TableCell>
              <TableCell>{p.priority}</TableCell>
              <TableCell className="text-sm">{formatDateTime(p.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/global-playlists/${p.id}`}>Manage</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {playlists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No playlists found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
