// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../src/store/auth.store';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
