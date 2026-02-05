import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";

export const HomeDock: React.FC = () => {
  return (
    <View className="absolute bottom-4 left-4 right-4 h-14 flex-row items-center justify-around rounded-3xl bg-surface-light/95 shadow-2xl dark:bg-background-dark/95">
      <DockItem
        label="Home"
        active
        onPress={() => router.push("/(app)")}
      />
      <DockItem
        label="Library"
        onPress={() => router.push("/(app)/library")}
      />
      <DockItem
        label="Browse"
        onPress={() => router.push("/(app)/browse")}
      />
      <DockItem label="Profile" onPress={() => router.push("/profile")} />
    </View>
  );
};

const DockItem: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="items-center justify-center"
  >
    <View
      className={
        active
          ? "mb-1 h-7 w-7 items-center justify-center rounded-full bg-primary"
          : "mb-1 h-7 w-7 items-center justify-center rounded-full bg-transparent"
      }
    >
      <Text
        className={
          active
            ? "text-xs font-semibold text-black"
            : "text-xs text-muted-light dark:text-muted-dark"
        }
      >
        ⬤
      </Text>
    </View>
    <Text
      className={
        active
          ? "text-[10px] font-semibold text-primary"
          : "text-[10px] text-muted-light dark:text-muted-dark"
      }
    >
      {label}
    </Text>
  </TouchableOpacity>
);
