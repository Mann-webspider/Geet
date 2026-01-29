"use client";

import { useState } from "react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UploadTrackDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        body: formData,
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        setErr(text || "Upload failed");
        return;
      }

      // refresh list
      mutate((key) => typeof key === "string" && key.startsWith("/api/admin/tracks"));
      setOpen(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Track</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload new track</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>MP3 file</Label>
            <Input name="file" type="file" accept="audio/mpeg,audio/mp3" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" required />
            </div>
            <div className="space-y-2">
              <Label>Artist</Label>
              <Input name="artist" required />
            </div>
            <div className="space-y-2">
              <Label>Album</Label>
              <Input name="album" />
            </div>
            <div className="space-y-2">
              <Label>Genre</Label>
              <Input name="genre" />
            </div>
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input name="duration" type="number" min={0} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="explicit" name="explicit" />
            <Label htmlFor="explicit">Explicit</Label>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
