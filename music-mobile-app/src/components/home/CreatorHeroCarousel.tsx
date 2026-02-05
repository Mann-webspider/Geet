// src/components/home/CreatorHeroCarousel.tsx
import React from "react";
import { ScrollView } from "react-native";
import { CreatorHeroCard, CreatorHero } from "./CreatorHeroCard";

type Props = {
  items: CreatorHero[];
  onPressItem?: (item: CreatorHero) => void;
};

export const CreatorHeroCarousel: React.FC<Props> = ({
  items,
  onPressItem,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ columnGap: 14 }}
    >
      {items.map((item) => (
        <CreatorHeroCard
          key={item.id}
          item={item}
          onPress={onPressItem}
        />
      ))}
    </ScrollView>
  );
};
