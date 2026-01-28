// src/screens/Splash/SplashScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {  apiClient } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

type SplashState = 'loading' | 'error';

type HealthResponse = { status: string; timestamp: number };
type AppConfigResponse = {
  apiVersion: string;
  minSupportedAppVersion: string;
  features: Record<string, boolean>;
};

const TOKEN_KEY = '@geet_token';

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { hydrateFromToken } = useAuthStore();
  const [state, setState] = useState<SplashState>('loading');
  const [error, setError] = useState<string | null>(null);

  const goAuth = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthStack' }],
    });

  const goApp = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'AppStack' }],
    });

  const run = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      // 1) check backend health + config
      const [health, config] = await Promise.all([
        apiClient.get<HealthResponse>('/health'),
        apiClient.get<AppConfigResponse>('/v1/app-config'),
      ]);

      if (!health?.status || !config?.apiVersion) {
        throw new Error('Invalid backend response');
      }

      // 2) read token
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        goAuth();
        return;
      }

      // 3) validate token via /me
      const result = await hydrateFromToken(storedToken);

      if (result === 'ok') {
        goApp();
      } else if (result === 'unauthorized') {
        goAuth();
      } else {
        // 'error' → network/server issue during /me
        throw new Error('Failed to validate session');
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to reach server');
      setState('error');
    }
  }, [hydrateFromToken, navigation]);

  useEffect(() => {
    run();
  }, [run]);

  if (state === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Geet</Text>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.subtitle}>Checking your session…</Text>
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
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { color: '#ccc', fontSize: 14, marginTop: 16 },
  error: { color: '#ff6b6b', fontSize: 16, textAlign: 'center', marginVertical: 16 },
});
