import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export const TrackList: React.FC<{ items: string[] }> = ({ items }) => (
  <View className="gap-3">
    {items.map((title, i) => (
      <View
        key={title}
        className="flex-row items-center justify-between rounded-2xl bg-surface-light px-3 py-3 dark:bg-background-dark/80"
      >
        <View>
          <Text className="text-sm text-text-light dark:text-text-dark">
            {title}
          </Text>
          <Text className="text-[11px] text-muted-light dark:text-muted-dark">
            Playlist • #{i + 1}
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-xs text-muted-light dark:text-muted-dark">
            ▶
          </Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
);
