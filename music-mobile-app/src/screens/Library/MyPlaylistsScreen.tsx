import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { playlistApi, type Playlist } from '../../api/playlist.api';
import { useFocusEffect } from 'expo-router';

type ScreenState = 'loading' | 'success' | 'error';

export const MyPlaylistsScreen: React.FC = () => {
  const { token } = useAuthStore();
  const [state, setState] = useState<ScreenState>('loading');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      setState('error');
      return;
    }

    try {
      setError(null);
      const data = await playlistApi.getMyPlaylists(token);
      setPlaylists(data);
      setState('success');
    } catch (e: any) {
      setError(e.message ?? 'Failed to load playlists');
      setState('error');
    }
  }, [token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlaylists();
    setRefreshing(false);
  }, [fetchPlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };
  useFocusEffect(
  useCallback(() => {
    fetchPlaylists();
  }, [fetchPlaylists]),
);


  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistCard}
      onPress={() => {
        // Expo Router dynamic route
        router.push(`/playlist/${item.id}`);
      }}
    >
      {item.coverArtUrl ? (
        <Image source={{ uri: item.coverArtUrl }} style={styles.coverArt} />
      ) : (
        <View style={[styles.coverArt, styles.placeholderCover]}>
          <Text style={styles.placeholderText}>🎵</Text>
        </View>
      )}

      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>
          {item.name}
        </Text>

        {item.description && (
          <Text style={styles.playlistDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.playlistMeta}>
          <Text style={styles.metaText}>
            {item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'}
          </Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaText}>{formatDuration(item.totalDuration)}</Text>
          
          {item.isCollaborative && (
            <>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.collaborativeBadge}>Collaborative</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (state === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading your playlists…</Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlaylists}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (playlists.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No playlists yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first playlist to get started
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            // Navigate to create playlist (to be implemented)
            // router.push('/playlist/create');
          }}
        >
          <Text style={styles.createButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <View style={styles.header}>
  <Text style={styles.headerTitle}>My Playlists</Text>
  <View style={styles.headerRow}>
    <Text style={styles.headerSubtitle}>{playlists.length} playlists</Text>
    <TouchableOpacity onPress={() => router.push('/(app)/playlist-create')}>
      <Text style={styles.createLink}>+ New</Text>
    </TouchableOpacity>
  </View>
</View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DB954"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
createLink: { color: '#1DB954', fontSize: 14, fontWeight: '600' },

  listContent: {
    padding: 16,
  },
  playlistCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  coverArt: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  placeholderCover: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistDescription: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#999',
    fontSize: 12,
  },
  metaSeparator: {
    color: '#555',
    marginHorizontal: 6,
  },
  collaborativeBadge: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
