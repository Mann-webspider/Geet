import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/auth.store';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, clearAuth } = useAuthStore();

  const logout = async () => {
    await clearAuth();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username ?? 'User'}!</Text>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(app)/library')}
      >
        <Text style={styles.cardIcon}>🎵</Text>
        <Text style={styles.cardTitle}>My Playlists</Text>
        <Text style={styles.cardSubtitle}>View and manage your music</Text>
      </TouchableOpacity>

      <Button title="Log out" onPress={logout} color="#ff6b6b" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#999',
    fontSize: 14,
  },
});
