    import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { playlistApi, type PlaylistDetail ,PlaylistTrackItem } from '../../api/playlist.api';

type ScreenState = 'loading' | 'success' | 'error';

export const PlaylistDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token ,user} = useAuthStore();
  const [state, setState] = useState<ScreenState>('loading');
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !token) {
      setError('Missing playlist or auth');
      setState('error');
      return;
    }

    setState('loading');
    setError(null);

    try {
      const data = await playlistApi.getPlaylistById(String(id), token);
      setPlaylist(data);
      setState('success');
    } catch (e: any) {
      setError(e.message ?? 'Failed to load playlist');
      setState('error');
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading playlist…</Text>
      </View>
    );
  }

  if (state === 'error' || !playlist) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const isPublicLabel = playlist.isPublic ? 'Public' : 'Private';
  const collabLabel = playlist.isCollaborative ? 'Collaborative' : 'Personal';
  const isOwner = user?.id === playlist.owner.id; // ensure user from auth store


  const canEditTracks = isOwner || playlist.isCollaborative;

const onRemoveTrack = (item: PlaylistTrackItem) => {
  if (!token) return;
  Alert.alert(
    'Remove track',
    `Remove "${item.track.title}" from this playlist?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await playlistApi.removeTrackFromPlaylist(
              token,
              playlist.id,
              item.id,
            );
            // re-fetch playlist
            await load();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to remove track');
          }
        },
      },
    ],
  );
};

const renderPlaylistTrack = ({ item }: { item: PlaylistTrackItem }) => (
  <View style={styles.trackRow}>
    <Text style={styles.trackPosition}>{item.position}</Text>
    <View style={styles.trackBody}>
      <Text style={styles.trackTitle}>{item.track.title}</Text>
      <Text style={styles.trackArtist}>{item.track.artist}</Text>
    </View>
    <Text style={styles.trackDuration}>
      {formatDuration(item.track.duration)}
    </Text>
    {canEditTracks && (
      <TouchableOpacity onPress={() => onRemoveTrack(item)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    )}
  </View>
);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Back</Text>
      </TouchableOpacity>
        {isOwner && (
  <TouchableOpacity
    style={styles.editButton}
    onPress={() => router.push(`/playlist-edit/${playlist.id}` as any)}
  >
    <Text style={styles.editButtonText}>Edit</Text>
  </TouchableOpacity>
)}
      <View style={styles.header}>
        {playlist.coverArtUrl ? (
          <Image source={{ uri: playlist.coverArtUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>🎵</Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={2}>
          {playlist.name}
        </Text>

        {playlist.description && (
          <Text style={styles.description}>{playlist.description}</Text>
        )}

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isPublicLabel}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{collabLabel}</Text>
          </View>
        </View>

        <Text style={styles.metaText}>
          {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'} ·{' '}
          {formatDuration(playlist.totalDuration)}
        </Text>
      </View>

      <View style={styles.section}>
  <Text style={styles.sectionTitle}>Tracks</Text>
  {playlist.tracks.length === 0 ? (
    <Text style={styles.tracksPlaceholderText}>
      No tracks in this playlist yet.
    </Text>
  ) : (
    <FlatList
      data={playlist.tracks}
      keyExtractor={(t) => t.id}
      renderItem={renderPlaylistTrack}
    />
  )}
</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, paddingTop: 48 },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { color: '#ccc', marginTop: 16 },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 12,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  backButton: { paddingHorizontal: 16, paddingVertical: 8 },
  backText: { color: '#1DB954' },
  backLink: { color: '#1DB954', marginBottom: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  cover: { width: 180, height: 180, borderRadius: 8, marginBottom: 16 },
  coverPlaceholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: { fontSize: 48 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  description: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  badgesRow: { flexDirection: 'row', marginTop: 12 },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  badgeText: { color: '#ccc', fontSize: 12 },
  metaText: { color: '#999', fontSize: 13, marginTop: 12 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  tracksPlaceholder: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
  },
  tracksPlaceholderText: { color: '#777', fontSize: 14 },
  editButton: {
  marginTop: 12,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#444',
},
editButtonText: { color: '#fff', fontSize: 14 },
trackRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
},
trackPosition: { color: '#666', width: 24 },
trackBody: { flex: 1 },
trackTitle: { color: '#fff', fontSize: 14 },
trackArtist: { color: '#aaa', fontSize: 12 },
trackDuration: { color: '#999', width: 60, textAlign: 'right', marginRight: 8 },
removeText: { color: '#ff6b6b', fontSize: 12 },

});
