import { Slot } from "expo-router";
import React from "react";
import { ThemeProvider } from "../src/ui/theme-provider";
import { AuthProvider } from "../src/store/auth.store";
import "../global.css";
import {
  useFonts,
  LeagueSpartan_700Bold,
  
} from "@expo-google-fonts/league-spartan";
import {LeagueGothic_400Regular} from "@expo-google-fonts/league-gothic"
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LeagueSpartan_700Bold,
    LeagueGothic_400Regular
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background-dark">
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}
