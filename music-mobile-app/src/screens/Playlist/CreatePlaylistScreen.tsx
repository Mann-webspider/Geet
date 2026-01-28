// src/screens/Playlist/CreatePlaylistScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { playlistApi } from '../../api/playlist.api';
import { PlaylistForm, PlaylistFormValues } from './PlaylistForm';

export const CreatePlaylistScreen: React.FC = () => {
  const { token } = useAuthStore();

  const handleSubmit = async (values: PlaylistFormValues) => {
    if (!token) throw new Error('Not authenticated');
    const created = await playlistApi.createPlaylist(token, {
      name: values.name,
      description: values.description || undefined,
      isPublic: values.isPublic,
      isCollaborative: values.isCollaborative,
    });

    // Option 1: let MyPlaylists re-fetch on focus
    router.back();

    // Option 2: if you use some playlist store, you can optimistically add here.
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create Playlist</Text>
      <PlaylistForm mode="create" onSubmit={handleSubmit} />
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
});
