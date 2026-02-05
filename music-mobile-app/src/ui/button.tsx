import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "./cn";

type Props = {
  label: string;
  variant?: "primary" | "outline";
  onPress?: () => void;
};

export const Button: React.FC<Props> = ({ label, variant = "primary", onPress }) => {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "w-full flex-row items-center justify-center rounded-2xl px-4 py-3",
        isPrimary
          ? "bg-lime-300"
          : "border border-zinc-500/40 bg-transparent",
      )}
    >
      <Text
        className={cn(
          "text-base font-semibold",
          isPrimary ? "text-black" : "text-black dark:text-lime-200 ",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
};
