import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/store/auth.store';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
