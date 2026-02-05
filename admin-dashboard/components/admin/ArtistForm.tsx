"use client";

import { useState } from "react";
import type { Artist, CreateArtistPayload, UpdateArtistPayload } from "@/lib/types/artist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  artist?: Artist;
  onSubmit: (payload: CreateArtistPayload | UpdateArtistPayload) => Promise<void>;
};

export function ArtistForm({ artist, onSubmit }: Props) {
  const [name, setName] = useState(artist?.name ?? "");
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [imageUrl, setImageUrl] = useState(artist?.imageUrl ?? "");
  const [bgImageUrl, setBgImageUrl] = useState(artist?.bgImageUrl ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(artist?.spotifyUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(artist?.youtubeUrl ?? "");
  const [isVerified, setIsVerified] = useState(artist?.isVerified ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        bio: bio.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        bgImageUrl: bgImageUrl.trim() || undefined,
        spotifyUrl: spotifyUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
      };

      if (artist) {
        payload.isVerified = isVerified;
      }

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
          placeholder="Imagine Dragons"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="imagine-dragons (auto-generated if empty)"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Artist biography..."
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bgImageUrl">Background Image URL</Label>
        <Input
          id="bgImageUrl"
          value={bgImageUrl}
          onChange={(e) => setBgImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="spotifyUrl">Spotify URL</Label>
        <Input
          id="spotifyUrl"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/artist/..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/@..."
        />
      </div>

      {artist ? (
        <div className="flex items-center space-x-2">
          <Switch id="verified" checked={isVerified} onCheckedChange={setIsVerified} />
          <Label htmlFor="verified">Verified artist</Label>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : artist ? "Update artist" : "Create artist"}
      </Button>
    </form>
  );
}
