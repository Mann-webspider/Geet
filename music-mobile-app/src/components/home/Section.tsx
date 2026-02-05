import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
};

export const HomeSection: React.FC<Props> = ({ title, onSeeAll, children }) => (
  <View className="mb-6">
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-sm font-semibold text-text-light dark:text-text-dark">
        {title}
      </Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-[11px] font-semibold text-muted-light dark:text-muted-dark">
            See all
          </Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);
