import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../src/api/auth.api';
import { useAuthStore } from '../src/store/auth.store';

export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const auth = await authApi.login({ email, password });
      await setAuth(auth);
      router.replace('/(app)');
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!submitting}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {submitting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Button title="Login" onPress={onSubmit} />
      )}
      <Text style={styles.link} onPress={() => router.push('/signup')}>
        Need an account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  error: { color: '#ff6b6b', marginBottom: 12 },
  link: { color: '#1DB954', marginTop: 16 },
});
