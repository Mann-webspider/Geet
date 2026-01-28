import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { MyPlaylistsScreen } from '../screens/Library/MyPlaylistsScreen';
import { playlistApi } from '../api/playlist.api';
import { useAuthStore } from '../store/auth.store';

jest.mock('../api/playlist.api');
jest.mock('../store/auth.store');

const mockPlaylistApi = playlistApi as jest.Mocked<typeof playlistApi>;
const mockUseAuthStore = useAuthStore as jest.Mock;

describe('MyPlaylistsScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuthStore.mockReturnValue({
      token: 'fake-token',
    });
  });

  it('loads and displays playlists', async () => {
    mockPlaylistApi.getMyPlaylists.mockResolvedValueOnce([
      {
        id: '1',
        name: 'My Favorites',
        description: 'Best songs',
        isCollaborative: false,
        isPublic: true,
        coverArtUrl: null,
        trackCount: 15,
        totalDuration: 3600,
      },
    ]);

    const { getByText } = render(<MyPlaylistsScreen />);

    await waitFor(() => {
      expect(getByText('My Favorites')).toBeTruthy();
      expect(getByText('Best songs')).toBeTruthy();
      expect(getByText('15 tracks')).toBeTruthy();
    });
  });

  it('shows empty state when no playlists', async () => {
    mockPlaylistApi.getMyPlaylists.mockResolvedValueOnce([]);

    const { getByText } = render(<MyPlaylistsScreen />);

    await waitFor(() => {
      expect(getByText('No playlists yet')).toBeTruthy();
    });
  });

  it('shows error and retry on failure', async () => {
    mockPlaylistApi.getMyPlaylists.mockRejectedValueOnce(
      new Error('Network error')
    );

    const { getByText } = render(<MyPlaylistsScreen />);

    await waitFor(() => {
      expect(getByText(/Network error/i)).toBeTruthy();
    });

    mockPlaylistApi.getMyPlaylists.mockResolvedValueOnce([]);
    fireEvent.press(getByText('Retry'));

    await waitFor(() => {
      expect(mockPlaylistApi.getMyPlaylists).toHaveBeenCalledTimes(2);
    });
  });
});
