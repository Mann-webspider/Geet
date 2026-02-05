import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "../../ui/button";

type Props = {
  onPressPlaylist?: () => void;
};

export const HeroCard: React.FC<Props> = ({ onPressPlaylist }) => {
  return (
    <View className="rounded-3xl bg-purple-400/90 p-[1px]">
      <View className="rounded-3xl bg-surface-light p-4 dark:bg-background-dark/80">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-900/80 dark:text-purple-100/80">
              Discover weekly
            </Text>
            <Text
              className="mt-1 text-base font-semibold text-text-light dark:text-text-dark"
              numberOfLines={1}
            >
              The original slow instrumental best playlists.
            </Text>
            <Text className="mt-2 text-[11px] text-muted-light dark:text-muted-dark">
              Hand‑picked based on your recent listening.
            </Text>
            <View className="mt-3 w-28">
              <Button
                label="Play"
                variant="primary"
                onPress={onPressPlaylist}
              />
            </View>
          </View>
          <View className="ml-3 h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600" />
        </View>
      </View>
    </View>
  );
};
