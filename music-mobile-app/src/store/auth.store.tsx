// src/store/auth.store.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, type AuthResult, type AuthUser } from '../api/auth.api';

const TOKEN_KEY = '@geet_token';

type HydrateResult = 'ok' | 'unauthorized' | 'error';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  setAuth: (auth: AuthResult) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrateFromToken: (token: string) => Promise<HydrateResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // initial token read (but not /me yet)
  useEffect(() => {
    const hydrateToken = async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) setToken(stored);
      } finally {
        setIsHydrating(false);
      }
    };
    hydrateToken();
  }, []);

  const setAuth = async (auth: AuthResult) => {
    setToken(auth.token);
    setUser(auth.user);
    await AsyncStorage.setItem(TOKEN_KEY, auth.token);
  };

  const clearAuth = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

 const hydrateFromToken = async (tokenArg: string): Promise<'ok' | 'unauthorized' | 'error'> => {
  try {
    const me = await authApi.getMe(tokenArg);
    setToken(tokenArg);
    setUser(me);
    return 'ok';
  } catch (e: any) {
    if (e?.type === 'unauthorized') {
      await clearAuth(); // remove token + user from store + AsyncStorage
      return 'unauthorized';
    }
    return 'error';
  }
};


  return (
    <AuthContext.Provider value={{ token, user, isHydrating, setAuth, clearAuth, hydrateFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthProvider');
  return ctx;
};
