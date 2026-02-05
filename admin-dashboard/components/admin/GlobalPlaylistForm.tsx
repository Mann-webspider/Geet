"use client";

import { useState } from "react";
import type {
  EditorialPlaylist,
  CreateEditorialPlaylistPayload,
  UpdateEditorialPlaylistPayload,
} from "@/lib/types/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  playlist?: EditorialPlaylist;
  onSubmit: (
    payload: CreateEditorialPlaylistPayload | UpdateEditorialPlaylistPayload
  ) => Promise<void>;
};

const EDITORIAL_TYPES = [
  { value: "curated_week", label: "Curated Week" },
  { value: "top_global_50", label: "Top Global 50" },
  { value: "top_50_india", label: "Top 50 India" },
  { value: "by_artist", label: "By Artist" },
  { value: "trending", label: "Trending" },
  { value: "custom", label: "Custom" },
];

export function GlobalPlaylistForm({ playlist, onSubmit }: Props) {
  const [name, setName] = useState(playlist?.name ?? "");
  const [description, setDescription] = useState(playlist?.description ?? "");
  const [editorialType, setEditorialType] = useState(playlist?.editorialType ?? "custom");
  const [coverArtUrl, setCoverArtUrl] = useState(playlist?.coverArtUrl ?? "");
  const [priority, setPriority] = useState(playlist?.priority ?? 0);
  const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? true);
  const [visibleOnHome, setVisibleOnHome] = useState(playlist?.visibleOnHome ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        editorialType: editorialType || undefined,
        coverArtUrl: coverArtUrl.trim() || undefined,
        priority,
        isPublic,
        visibleOnHome,
      };

      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Top Global 50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Playlist description..."
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label>Editorial Type</Label>
        <Select value={editorialType} onValueChange={setEditorialType}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {EDITORIAL_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coverArtUrl">Cover Art URL</Label>
        <Input
          id="coverArtUrl"
          value={coverArtUrl}
          onChange={(e) => setCoverArtUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="priority">Priority (0 = highest)</Label>
        <Input
          id="priority"
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="public">Public</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="home" checked={visibleOnHome} onCheckedChange={setVisibleOnHome} />
        <Label htmlFor="home">Visible on home</Label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : playlist ? "Update playlist" : "Create playlist"}
      </Button>
    </form>
  );
}
