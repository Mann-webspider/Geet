import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

type Card = { title: string; subtitle: string };

const mockPlaylists: Card[] = [
  { title: "Starlit Reverie", subtitle: "Budariti" },
  { title: "Midnight Confessions", subtitle: "Various Artists" },
  { title: "Soft Echoes", subtitle: "Ambient Collective" },
  { title: "Deep Focus", subtitle: "Geet Mix" },
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
        className="w-28"
      >
        {/* square cover box */}
        <View className="mb-2 h-28 w-28 overflow-hidden rounded-2xl bg-surface-light dark:bg-background-dark/80">
          {/* replace this with Image if you have real covers */}
          <View className="h-full w-full bg-gradient-to-br from-primary/70 via-emerald-400/50 to-background-dark" />
        </View>

        {/* text outside the box */}
        <Text
          className="text-[13px] font-semibold text-text-light dark:text-text-dark"
          numberOfLines={1}
        >
          {p.title}
        </Text>
        <Text
          className="text-[11px] text-muted-light dark:text-muted-dark"
          numberOfLines={1}
        >
          {p.subtitle}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
