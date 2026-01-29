"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notify } from "@/lib/notify";

export function IngestionJobCreateDialog({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"youtube" | "torrent" | "manual">("youtube");
  const [sourceInput, setSourceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!sourceInput.trim()) {
      setError("Source input is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.createJob({ sourceType, sourceInput: sourceInput.trim() });
      setOpen(false);
      setSourceInput("");
      onCreated();
      notify.success("Job created");
      router.push(`/admin/ingestion-jobs/${res.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create job");
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New job</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create ingestion job</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Source type</Label>
            <RadioGroup value={sourceType} onValueChange={(v) => setSourceType(v as any)} className="grid gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="youtube" id="youtube" />
                <Label htmlFor="youtube">YouTube</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="torrent" id="torrent" />
                <Label htmlFor="torrent">Torrent (later)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual (later)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Source input</Label>
            <Input
              placeholder="YouTube URL or search query"
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
