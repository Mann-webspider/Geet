// src/screens/Playlist/EditPlaylistScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { playlistApi, PlaylistDetail } from '../../api/playlist.api';
import { PlaylistForm, PlaylistFormValues } from './PlaylistForm';

export const EditPlaylistScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuthStore();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token || !id) {
      setError('Missing playlist or auth');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const data = await playlistApi.getPlaylistById(String(id), token);
      setPlaylist(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, token]);

  const handleSubmit = async (values: PlaylistFormValues) => {
    if (!token || !id) throw new Error('Missing auth');
    await playlistApi.updatePlaylist(token, String(id), {
      name: values.name,
      description: values.description || undefined,
      isPublic: values.isPublic,
      isCollaborative: values.isCollaborative,
    });
    router.back(); // return to details
  };

  const handleDelete = async () => {
    console.log('delete pressed', { token, id });
    if (!token || !id) return;
    Alert.alert(
      'Delete playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await playlistApi.deletePlaylist(token, String(id));
              // Go back to library
              router.replace('/(app)/library');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to delete playlist');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1DB954" />
      </View>
    );
  }

  if (error || !playlist) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.id === playlist.owner.id;
  console.log('user', user);
console.log('owner', playlist.owner);
console.log('isOwner', isOwner);


  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Edit Playlist</Text>
      <PlaylistForm
        mode="edit"
        initialValues={{
          name: playlist.name,
          description: playlist.description ?? '',
          isPublic: playlist.isPublic,
          isCollaborative: playlist.isCollaborative,
        }}
        onSubmit={handleSubmit}
      />
      {isOwner && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Playlist</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: '#ff6b6b', marginBottom: 12 },
  retryText: { color: '#1DB954' },
  deleteButton: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  deleteText: { color: '#ff6b6b', fontWeight: '600' },
});
