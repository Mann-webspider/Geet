import React from "react";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/themed";
import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/theme.store";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const mode = useThemeStore((s) => s.mode);

  const effective = mode === "system"
    ? systemScheme ?? "light"
    : mode; // 'light' | 'dark'

  return (
    <GluestackUIProvider
      config={config}
      colorMode={effective === "dark" ? "dark" : "light"}
    >
      {children}
    </GluestackUIProvider>
  );
};
