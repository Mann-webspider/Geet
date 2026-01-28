// src/api/playlist.api.ts
import { apiClient } from './client';

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  isCollaborative: boolean;
  isPublic: boolean;
  coverArtUrl: string | null;
  trackCount: number;
  totalDuration: number; // seconds
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  fileUrl: string;
  coverArtUrl: string | null;
  genre: string;
  releaseYear: number;
  isExplicit: boolean;
};

export type PlaylistTrackItem = {
  id: string;
  position: number;
  addedAt: string;
  track: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    coverArtUrl: string | null;
  };
};

// extend existing
export type PlaylistDetail = Playlist & {
  createdAt: string;
  updatedAt: string;
  owner: { id: string };
  tracks: PlaylistTrackItem[];
};



type SuccessEnvelope<T> = {
  status: 'success';
  data: T;
};

export const playlistApi = {
  // already have this
  async getMyPlaylists(token: string): Promise<Playlist[]> {
    const res = await apiClient.get<SuccessEnvelope<Playlist[]>>(
      '/v1/playlists/mine',
      token,
    );
    if (res.status !== 'success') {
      throw new Error('Failed to fetch playlists');
    }
    return res.data;
  },

  async getPlaylistById(id: string, token: string): Promise<PlaylistDetail> {
    const res = await apiClient.get<SuccessEnvelope<PlaylistDetail>>(
      `/v1/playlists/${id}`,
      token,
    );
    if (res.status !== 'success') {
      throw new Error('Failed to fetch playlist');
    }
    return res.data;
  },
  async createPlaylist(
    token: string,
    data: {
      name: string;
      description?: string;
      isCollaborative?: boolean;
      isPublic?: boolean;
    },
  ): Promise<PlaylistDetail> {
    const res = await apiClient.post<SuccessEnvelope<PlaylistDetail>>(
      '/v1/playlists',
      data,
      token,
    );
    if (res.status !== 'success') throw new Error('Failed to create playlist');
    return res.data;
  },

  async updatePlaylist(
    token: string,
    id: string,
    data: {
      name?: string;
      description?: string;
      isCollaborative?: boolean;
      isPublic?: boolean;
      coverArtUrl?: string | null;
    },
  ): Promise<PlaylistDetail> {
    const res = await apiClient.patch<SuccessEnvelope<PlaylistDetail>>(
      `/v1/playlists/${id}`,
      data,
      token,
    );
    if (res.status !== 'success') throw new Error('Failed to update playlist');
    return res.data;
  },

  async deletePlaylist(token: string, id: string): Promise<void> {
    const res = await apiClient.delete<{ status: string }>(
      `/v1/playlists/${id}`,
      token,
    );
    if (res.status !== 'success') throw new Error('Failed to delete playlist');
  },
   async addTrackToPlaylist(
    token: string,
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    await apiClient.post<SuccessEnvelope<unknown>>(
      `/v1/playlists/${playlistId}/tracks`,
      { trackId },
      token,
    );
  },

  async removeTrackFromPlaylist(
    token: string,
    playlistId: string,
    playlistTrackId: string,
  ): Promise<void> {
    await apiClient.delete<SuccessEnvelope<unknown>>(
      `/v1/playlists/${playlistId}/tracks/${playlistTrackId}`,
      token,
    );
  },
};
