"use client";

import { useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/http-error";

export function TrackUploadDialog({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExplicit, setIsExplicit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      form.set("isExplicit", String(isExplicit));
  await adminApi.uploadTrack(form);
  notify.success("Upload complete", "Track was created successfully.");
  onUploaded();
  setOpen(false);
} catch (e) {
  notify.error("Upload failed", getErrorMessage(e));
}
 finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Track</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload track</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>MP3 file</Label>
            <Input name="file" type="file" accept="audio/mpeg,audio/mp3" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Artist</Label>
              <Input name="artist" placeholder="Unknown Artist" />
            </div>
            <div className="space-y-2">
              <Label>Album</Label>
              <Input name="album" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Genre</Label>
              <Input name="genre" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input name="duration" type="number" min={0} defaultValue={0} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Explicit</div>
              <div className="text-xs text-muted-foreground">Mark content as explicit</div>
            </div>
            <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
