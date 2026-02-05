"use client";

import { formatDateTime } from "@/lib/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type Track = {
  id: string;
  title: string;
  album: string | null;
  duration: number;
  playCount: number;
  fileUrl: string;
  coverArtUrl: string | null;
  createdAt: string;
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TrackListTable({ tracks }: { tracks: Track[] }) {
  function playTrack(url: string) {
    const audio = new Audio(url);
    audio.play();
  }

  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Album</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Plays</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.title}</TableCell>
              <TableCell>{t.album ?? "—"}</TableCell>
              <TableCell>{formatDuration(t.duration)}</TableCell>
              <TableCell>{t.playCount}</TableCell>
              <TableCell className="text-sm">{formatDateTime(t.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playTrack(t.fileUrl)}
                  title="Play test"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tracks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                No tracks
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
