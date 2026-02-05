"use client";

import Link from "next/link";
import Image from "next/image";
import type { Artist } from "@/lib/types/artist";
import { formatDateTime } from "@/lib/utils/date";
import { VerifiedBadge } from "./VerifiedBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ArtistsTable({ artists }: { artists: Artist[] }) {
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}
              </TableCell>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{a.slug}</TableCell>
              <TableCell>
                <VerifiedBadge isVerified={a.isVerified} />
              </TableCell>
              <TableCell className="text-sm">{formatDateTime(a.createdAt)}</TableCell>
              <TableCell className="text-sm">{formatDateTime(a.updatedAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/artists/${a.id}`}>View</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/artists/${a.id}/edit`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {artists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No artists found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
