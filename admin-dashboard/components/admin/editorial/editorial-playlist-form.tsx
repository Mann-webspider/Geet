"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface EditorialPlaylistFormValues {
  name: string;
  description?: string;
  coverArtUrl?: string;
  visibleOnHome: boolean;
  priority: number;
}

export function EditorialPlaylistForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial: EditorialPlaylistFormValues;
  onSubmit: (values: EditorialPlaylistFormValues) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof EditorialPlaylistFormValues>(
    key: K,
    value: EditorialPlaylistFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      await onSubmit(values);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save playlist");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Chill Vibes"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={values.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Hand-picked tracks for your evening."
        />
      </div>

      <div className="space-y-2">
        <Label>Cover art URL</Label>
        <Input
          value={values.coverArtUrl ?? ""}
          onChange={(e) => update("coverArtUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <Label>Visible on home</Label>
          <p className="text-xs text-muted-foreground">
            Control whether this appears on the user home feed.
          </p>
        </div>
        <Switch
          checked={values.visibleOnHome}
          onCheckedChange={(v) => update("visibleOnHome", v)}
        />
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Input
          type="number"
          value={values.priority}
          onChange={(e) => update("priority", Number(e.target.value) || 0)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
