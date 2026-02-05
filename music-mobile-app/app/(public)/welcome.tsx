// app/(public)/welcome.tsx
import React from "react";
import { View, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "../../src/ui/button";




export default function WelcomeScreen() {
  return (
    <View className="flex-1  dark:bg-background-dark">
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        {/* animated background (native only) */}
        

        {/* overlay scrim using palette */}
        <View className="absolute inset-0 bg-surface-light/60 dark:bg-background-dark/80" />

        <View className="flex-1 px-6 pt-14 pb-10">
          {/* small label */}
          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
              Geet • Music streaming
            </Text>
          </View>

          {/* hero */}
          <View className="flex-1 items-center justify-center">
            <Animated.View
              entering={FadeInDown.duration(600).springify().damping(14)}
              className="items-center"
            >
              <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-background-dark/90 dark:bg-surface-light">
                <Text className="text-4xl font-extrabold text-primary">
                  ♫
                </Text>
              </View>

              <Text
                style={{ fontFamily: "LeagueSpartan_700Bold" }}
                className="text-center text-4xl leading-tight text-text-light dark:text-text-dark"
              >
                SEND YOUR
              </Text>
              <Text
                style={{ fontFamily: "LeagueSpartan_700Bold" }}
                className="mt-1 text-center text-4xl leading-tight text-text-light dark:text-text-dark"
              >
                SOUND WORLDWIDE
              </Text>

              <Text className="mt-4 max-w-xs text-center text-sm font-medium text-muted-light dark:text-muted-dark">
                Save your favorites, discover new artists, and stream with a{" "}
                <Text className="font-semibold text-text-light dark:text-text-dark">
                  minimal
                </Text>{" "}
                and{" "}
                <Text className="font-semibold text-text-light dark:text-text-dark">
                  colorful
                </Text>{" "}
                experience.
              </Text>
            </Animated.View>
          </View>

          {/* buttons */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(500).springify()}
            className="gap-3"
          >
            <Button
              label="Log in"
              variant="primary"
              onPress={() => router.push("/login")}
            />
            <Button
              label="New here? Register"
              variant="outline"
              onPress={() => router.push("/signup")}
            />
          </Animated.View>
        </View>
    </SafeAreaView>
      </View>
  );
}
