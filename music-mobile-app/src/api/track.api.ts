import { apiClient } from './client';
import type { Track } from './playlist.api';

type SuccessEnvelope<T> = { status: 'success'; data: T };

export const trackApi = {
  async getTracks(token: string): Promise<Track[]> {
    const res = await apiClient.get<SuccessEnvelope<Track[]>>('/v1/tracks', token);
    if (res.status !== 'success') throw new Error('Failed to fetch tracks');
    return res.data;
  },

  async searchTracks(token: string, query: string): Promise<Track[]> {
    const res = await apiClient.get<SuccessEnvelope<Track[]>>(
      `/v1/tracks/search?q=${encodeURIComponent(query)}`,
      token,
    );
    if (res.status !== 'success') throw new Error('Failed to search tracks');
    return res.data;
  },
};
