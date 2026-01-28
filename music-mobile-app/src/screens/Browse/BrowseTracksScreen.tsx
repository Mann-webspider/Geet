import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { trackApi } from '../../api/track.api';
import { playlistApi, type Track, type Playlist } from '../../api/playlist.api';
import { useDebouncedCallback } from 'use-debounce';

type ScreenState = 'loading' | 'success' | 'error';

export const BrowseTracksScreen: React.FC = () => {
  const { token } = useAuthStore();
  const [state, setState] = useState<ScreenState>('loading');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const loadTracks = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      setState('error');
      return;
    }
    try {
      setError(null);
      setState('loading');
      const data = await trackApi.getTracks(token);
      setTracks(data);
      setState('success');
    } catch (e: any) {
      setError(e.message ?? 'Failed to load tracks');
      setState('error');
    }
  }, [token]);

  const loadPlaylists = useCallback(async () => {
    if (!token) return;
    try {
      const data = await playlistApi.getMyPlaylists(token);
      setPlaylists(data);
    } catch {
      // ignore, just no playlists in picker
    }
  }, [token]);

  const debouncedSearch = useDebouncedCallback(async (q: string) => {
    if (!token) return;
    if (!q.trim()) {
      // back to all tracks
      loadTracks();
      return;
    }
    try {
      setSearching(true);
      const data = await trackApi.searchTracks(token, q.trim());
      setTracks(data);
      setState('success');
    } catch (e: any) {
      setError(e.message ?? 'Search failed');
      setState('error');
    } finally {
      setSearching(false);
    }
  }, 400);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openAddPicker = async (track: Track) => {
    setSelectedTrack(track);
    setPickerVisible(true);
    await loadPlaylists();
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!token || !selectedTrack) return;
    try {
      await playlistApi.addTrackToPlaylist(token, playlist.id, selectedTrack.id);
      setPickerVisible(false);
      setSelectedTrack(null);
      // TODO: hook a toast/snackbar of your choice
      console.log(`Track added to ${playlist.name}`);
    } catch (e: any) {
      console.log('add error', e);
    }
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <View style={styles.trackRow}>
      {item.coverArtUrl ? (
        <Image source={{ uri: item.coverArtUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverPlaceholderText}>🎵</Text>
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist} • {item.album}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openAddPicker(item)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </View>
  );

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1DB954" />
        <Text style={styles.loadingText}>Loading tracks…</Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadTracks}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Tracks</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title, artist, or album"
          placeholderTextColor="#666"
          style={styles.search}
        />
        {searching && (
          <Text style={styles.searchingText}>Searching…</Text>
        )}
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        renderItem={renderTrack}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to playlist</Text>
            {playlists.length === 0 ? (
              <Text style={styles.modalEmpty}>No playlists yet</Text>
            ) : (
              playlists.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.playlistRow}
                  onPress={() => handleAddToPlaylist(p)}
                >
                  <Text style={styles.playlistName}>{p.name}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#ccc', marginTop: 12 },
  errorText: { color: '#ff6b6b', marginBottom: 12 },
  retryText: { color: '#1DB954' },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  search: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
  },
  searchingText: { color: '#666', marginTop: 6, fontSize: 12 },
  listContent: { padding: 16 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cover: { width: 56, height: 56, borderRadius: 4, marginRight: 12 },
  coverPlaceholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: { fontSize: 24 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  trackArtist: { color: '#aaa', fontSize: 13 },
  duration: { color: '#999', marginRight: 8, width: 50, textAlign: 'right' },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#1DB954', fontSize: 18 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalEmpty: { color: '#aaa', marginBottom: 12 },
  playlistRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  playlistName: { color: '#fff', fontSize: 16 },
  modalClose: { marginTop: 12, alignItems: 'center' },
  modalCloseText: { color: '#1DB954', fontSize: 16 },
});
