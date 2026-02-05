"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api"; // your adminApi
import type { Artist } from "@/types/artist";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type Props = {
  open: boolean;
  trackId: string | null;
  onClose: () => void;
  onAssigned?: () => void;
};

export function ArtistPickerDialog({ open, trackId, onClose, onAssigned }: Props) {
  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    loadArtists("");
  }, [open]);

  async function loadArtists(term: string) {
    setLoading(true);
    try {
      const data = await adminApi.listArtistsLite({ search: term, limit: 50 });
      setArtists(data.data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load artists");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(term: string) {
    setSearch(term);
    loadArtists(term);
  }

  async function handleSelect(artist: Artist) {
    if (!trackId) return;
    try {
      await adminApi.assignTrackArtist(trackId, artist.id);
      toast.success(`Assigned to ${artist.name}`);
      onClose();
      onAssigned?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to assign artist");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select artist</DialogTitle>
        </DialogHeader>

        <Command>
          <CommandInput
            placeholder="Search artist..."
            value={search}
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : artists.length === 0 ? (
              <CommandEmpty>No artists found</CommandEmpty>
            ) : (
              artists.map((a) => (
                <CommandItem key={a.id} onSelect={() => handleSelect(a)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {a.imageUrl ? <AvatarImage src={a.imageUrl} /> : null}
                      <AvatarFallback>{a.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm">{a.name}</span>
                      <span className="text-xs text-muted-foreground">/{a.slug}</span>
                    </div>
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
