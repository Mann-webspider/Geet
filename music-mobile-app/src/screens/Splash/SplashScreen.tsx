// src/screens/Splash/SplashScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';

type SplashState = 'loading' | 'error';

type HealthResponse = { status: string; timestamp: number };
type AppConfigResponse = { apiVersion: string; minSupportedAppVersion: string; features: Record<string, boolean> };

export const SplashScreen: React.FC = () => {
  const { token, isHydrating } = useAuthStore();
  const [state, setState] = useState<SplashState>('loading');
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const [health, config] = await Promise.all([
        apiClient.get<HealthResponse>('/health'),
        apiClient.get<AppConfigResponse>('/v1/app-config'),
      ]);
      if (!health?.status || !config?.apiVersion) {
        throw new Error('Invalid backend response');
      }
      if (token) {
        router.replace('/(app)');
      } else {
        router.replace('/login');
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to reach server');
      setState('error');
    }
  }, [token]);

  useEffect(() => {
    if (!isHydrating) {
      run();
    }
  }, [isHydrating, run]);

  if (state === 'loading' || isHydrating) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Geet</Text>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.subtitle}>Preparing your music…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geet</Text>
      <Text style={styles.error}>{error}</Text>
      <Button title="Retry" onPress={run} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: '#ccc', fontSize: 14, marginTop: 16 },
  error: { color: '#ff6b6b', marginVertical: 16, textAlign: 'center' },
});
