// src/store/auth.store.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResult, AuthUser } from '../api/auth.api';

const TOKEN_KEY = '@geet_token';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  setAuth: (auth: AuthResult) => Promise<void>;
  clearAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          // user stays null for now; /me will fill it later
        }
      } finally {
        setIsHydrating(false);
      }
    };
    hydrate();
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

  return (
    <AuthContext.Provider value={{ token, user, isHydrating, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthStore must be used within AuthProvider');
  return ctx;
};
