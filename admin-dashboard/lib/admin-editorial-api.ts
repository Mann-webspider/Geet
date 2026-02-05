export type EditorialType = "home_curated" | "trending" | null;

export interface EditorialPlaylist {
  id: string;
  name: string;
  description?: string | null;
  coverArtUrl?: string | null;
  isEditorial: boolean;
  editorialType: EditorialType;
  visibleOnHome: boolean;
  priority: number;
  updatedAt: string;
  createdAt: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration?: number | null;
}

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      // attach JWT here
    },
  });

  if (res.status === 401 || res.status === 403) {
    // clear auth + redirect on client-side
    if (typeof window !== "undefined") {
      // localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const msg = (await res.text()) || "Request failed";
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export function getEditorialPlaylists() {
  return api<EditorialPlaylist[]>("/v1/admin/editorial-playlists");
}

export function getEditorialPlaylistById(id: string) {
  return api<EditorialPlaylist>(`/v1/admin/editorial-playlists/${id}`);
}

export function createEditorialPlaylist(body: {
  name: string;
  description?: string;
  coverArtUrl?: string;
  visibleOnHome?: boolean;
  priority?: number;
}) {
  return api<EditorialPlaylist>("/v1/admin/editorial-playlists", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateEditorialPlaylist(
  id: string,
  body: {
    name?: string;
    description?: string | null;
    coverArtUrl?: string | null;
    visibleOnHome?: boolean;
    priority?: number;
  },
) {
  return api<EditorialPlaylist>(`/v1/admin/editorial-playlists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function setEditorialPlaylistTracks(id: string, trackIds: string[]) {
  return api<void>(`/v1/admin/editorial-playlists/${id}/tracks`, {
    method: "POST",
    body: JSON.stringify({ trackIds }),
  });
}

export function refreshTrendingPlaylist(body?: {
  windowHours?: number;
  limit?: number;
}) {
  return api<{ playlistId: string; trackCount: number }>(
    "/v1/admin/editorial-playlists/trending/refresh",
    {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    },
  );
}
