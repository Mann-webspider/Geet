import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";

const labels = ["All", "New Release", "Trending", "Top"];

export const FilterChips: React.FC = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ columnGap: 8 }}
    >
      {labels.map((label, index) => {
        const active = index === 0;
        return (
          <TouchableOpacity
            key={label}
            className={
              active
                ? "rounded-lg bg-primary px-4 py-2"
                : "rounded-lg bg-surface-light px-4 py-2 dark:bg-surface-dark"
            }
          >
            <Text
              className={
                active
                  ? "text-xs font-semibold text-black"
                  : "text-xs text-muted-light dark:text-muted-dark"
              }
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
