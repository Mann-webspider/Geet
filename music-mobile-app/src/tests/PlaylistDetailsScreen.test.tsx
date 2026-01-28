import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { PlaylistDetailsScreen } from '../screens/Playlist/PlaylistDetailsScreen';
import { playlistApi } from '../api/playlist.api';
import { useAuthStore } from '../store/auth.store';
import * as expoRouter from 'expo-router';

jest.mock('../api/playlist.api');
jest.mock('../store/auth.store');
jest.spyOn(expoRouter, 'useLocalSearchParams').mockReturnValue({ id: '123' } as any);

const mockPlaylistApi = playlistApi as jest.Mocked<typeof playlistApi>;
const mockUseAuthStore = useAuthStore as jest.Mock;

describe('PlaylistDetailsScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuthStore.mockReturnValue({
      token: 'fake-token',
    } as any);
  });

  it('renders name and meta on success', async () => {
    mockPlaylistApi.getPlaylistById.mockResolvedValueOnce({
      id: '123',
      name: 'Focus Mix',
      description: 'Deep work tracks',
      isCollaborative: false,
      isPublic: true,
      coverArtUrl: null,
      trackCount: 10,
      totalDuration: 1800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'owner-id' },
      tracks: [],
    });

    const { getByText } = render(<PlaylistDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Focus Mix')).toBeTruthy();
      expect(getByText(/10 tracks/i)).toBeTruthy();
    });
  });

  it('shows error and retry on failure', async () => {
    mockPlaylistApi.getPlaylistById.mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { getByText } = render(<PlaylistDetailsScreen />);

    await waitFor(() => {
      expect(getByText(/Network error/i)).toBeTruthy();
    });

    mockPlaylistApi.getPlaylistById.mockResolvedValueOnce({
      id: '123',
      name: 'Focus Mix',
      description: null,
      isCollaborative: false,
      isPublic: true,
      coverArtUrl: null,
      trackCount: 0,
      totalDuration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'owner-id' },
      tracks: [],
    });

    fireEvent.press(getByText('Retry'));

    await waitFor(() => {
      expect(mockPlaylistApi.getPlaylistById).toHaveBeenCalledTimes(2);
    });
  });
});
