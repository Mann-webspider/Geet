import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

type Card = { title: string; subtitle: string };

const mockPlaylists: Card[] = [
  { title: "Starlit Reverie", subtitle: "By Budariti • 8 songs" },
  { title: "Midnight Confessions", subtitle: "Lo‑fi • 12 songs" },
  { title: "Soft Echoes", subtitle: "Ambient • 16 songs" },
];

export const PlaylistRow: React.FC<{ onPressCard?: () => void }> = ({
  onPressCard,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ columnGap: 12 }}
  >
    {mockPlaylists.map((p) => (
      <TouchableOpacity
        key={p.title}
        onPress={onPressCard}
        className="w-60 rounded-2xl bg-surface-light px-4 py-3 dark:bg-background-dark/85"
      >
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-text-light dark:text-text-dark">
              {p.title}
            </Text>
            <Text className="text-[11px] text-muted-light dark:text-muted-dark">
              {p.subtitle}
            </Text>
          </View>
        </View>
        <Text className="text-[11px] text-muted-light dark:text-muted-dark">
          Tap to open playlist.
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
