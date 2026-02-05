// src/components/home/CreatorHeroCard.tsx
import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";

export type CreatorHero = {
  id: string;
  title: string;
  subtitle: string;
  image: any; // require(...)
};

type Props = {
  item: CreatorHero;
  onPress?: (item: CreatorHero) => void;
};

export const CreatorHeroCard: React.FC<Props> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      className="h-56 w-56 rounded-3xl overflow-hidden"
      onPress={() => onPress?.(item)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={item.image}
        resizeMode="cover"
        className="flex-1"
      >
        {/* dark gradient overlay for text readability */}
        <View className="flex-1 justify-end bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2">
          <View className="rounded-2xl bg-black/40 px-3 py-2">
            {/* <Text
              className="text-xs font-semibold uppercase tracking-[0.15em] text-primary"
              numberOfLines={1}
            >
              Discover weekly
            </Text> */}
            <Text
              className="mt-1 text-sm font-semibold text-white"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              className="mt-0.5 text-[11px] text-zinc-300"
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};
