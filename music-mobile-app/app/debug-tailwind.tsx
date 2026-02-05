import React from "react";
import { View, Text } from "react-native";

export default function DebugTailwind() {
  return (
    <View className="flex-1 items-center justify-center bg-red-500">
      <Text className="text-white text-2xl font-bold">Tailwind OK</Text>
    </View>
  );
}
