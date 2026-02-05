import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/auth.store";
import { HomeSection } from "../../src/components/home/Section";
import { FilterChips } from "../../src/components/home/FilterChips";
import { HeroCard } from "../../src/components/home/HeroCard";
import { PlaylistRow } from "../../src/components/home/PlaylistRow";
import { TrackList } from "../../src/components/home/TrackList";
import { HomeDock } from "../../src/components/home/HomeDock";
import { router } from "expo-router";

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-surface-light">
      <View className="flex-1">
        {/* gradient-like header */}
        <View className="rounded-b-3xl bg-gradient-to-br from-purple-700 via-black to-black px-5 pb-4 pt-3">
          {/* top row: avatar + icons (simplified) */}
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                <Text className="text-base font-semibold text-black">
                  {user?.username?.[0]?.toUpperCase() ?? "G"}
                </Text>
              </View>
              
            </View>
           
          </View>

          {/* filter chips */}
          <FilterChips />
        </View>

        {/* main scroll content */}
        <ScrollView
          className="mt-4 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <HomeSection title="Curated & trending">
            <HeroCard onPressPlaylist={() => router.push("/(app)/library")} />
          </HomeSection>

          <HomeSection
            title="Top daily playlists"
            onSeeAll={() => router.push("/(app)/library")}
          >
            <PlaylistRow onPressCard={() => router.push("/(app)/library")} />
          </HomeSection>

          <HomeSection
            title="Recently listened"
            onSeeAll={() => router.push("/(app)/library")}
          >
            <TrackList
              items={["Lo‑fi Study", "Midnight Vibes", "Soft Echoes", "Deep Sleep"]}
            />
          </HomeSection>

          <HomeSection
            title="Popular now"
            onSeeAll={() => router.push("/(app)/browse")}
          >
            <TrackList
              items={["Top Global", "Top India", "Viral Today", "Charts Mix"]}
            />
          </HomeSection>
        </ScrollView>

        {/* bottom dock */}
        <HomeDock />
      </View>
    </SafeAreaView>
  );
}
