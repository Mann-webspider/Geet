import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
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
      <Button title="Log out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, marginBottom: 16 },
});
