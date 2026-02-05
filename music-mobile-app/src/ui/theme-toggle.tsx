import React from "react";
import { View, Pressable, Text } from "react-native";
import { Sun, Moon, Monitor } from "lucide-react-native";
import { useThemeStore } from "../store/theme.store";

export const ThemeToggle: React.FC = () => {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const Item = ({
    value,
    icon,
    label,
  }: {
    value: "system" | "light" | "dark";
    icon: React.ReactNode;
    label: string;
  }) => {
    const active = mode === value;
    return (
      <Pressable
        onPress={() => setMode(value)}
        className={`flex-1 flex-row items-center justify-center rounded-full px-3 py-2 ${
          active ? "bg-black/80 dark:bg-white" : "bg-black/10 dark:bg-white/10"
        }`}
      >
        {icon}
        <Text
          className={`ml-1 text-xs font-semibold ${
            active ? "text-white dark:text-black" : "text-white/80 dark:text-zinc-200"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-row gap-1 rounded-full bg-black/5 p-1 dark:bg-white/5">
      <Item
        value="system"
        icon={<Monitor size={14} color="#a3a3a3" />}
        label="System"
      />
      <Item value="light" icon={<Sun size={14} color="#fbbf24" />} label="Light" />
      <Item value="dark" icon={<Moon size={14} color="#38bdf8" />} label="Dark" />
    </View>
  );
};
