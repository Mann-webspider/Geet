// app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { authApi } from "../src/api/auth.api";
import { useAuthStore } from "../src/store/auth.store";
import { Button } from "../src/ui/button";
import { TouchableWithoutFeedback } from "react-native";

export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      console.log(email," ", password);
      
      const auth = await authApi.login({ email, password });
      
      await setAuth(auth);
      router.replace("/(app)");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
      {/* app label */}
      <View className="absolute top-10 left-6">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-light dark:text-muted-dark">
          Geet
        </Text>
      </View>

      {/* ticket card */}
      <View className="w-full max-w-sm rounded-3xl border border-zinc-200/60 bg-surface-light/95 p-6 shadow-2xl dark:border-white/10 dark:bg-surface-dark/95">
        <Text
          style={{ fontFamily: "LeagueSpartan_700Bold" }}
          className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-light dark:text-muted-dark"
        >
          Log in
        </Text>
        <Text
          style={{ fontFamily: "LeagueSpartan_700Bold" }}
          className="mb-4 text-2xl leading-tight text-text-light dark:text-text-dark"
        >
          Access your queue
        </Text>

        {/* email */}
        <View className="mb-4">
          <Text className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-light dark:text-muted-dark">
            Email
          </Text>
          <TextInput
            className="h-10 rounded-xl border border-zinc-300 bg-surface-light px-3 text-sm text-text-light dark:border-zinc-700 dark:bg-background-dark dark:text-text-dark"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
          />
        </View>

        {/* password */}
        <View className="mb-2">
          <Text className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-light dark:text-muted-dark">
            Password
          </Text>
          <TextInput
            className="h-10 rounded-xl border border-zinc-300 bg-surface-light px-3 text-sm text-text-light dark:border-zinc-700 dark:bg-background-dark dark:text-text-dark"
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
          />
        </View>

        {error && (
          <Text className="mt-1 text-[11px] font-semibold text-red-500">
            {error}
          </Text>
        )}

        <View className="mt-5 gap-3">
          {submitting ? (
            <View className="h-10 items-center justify-center rounded-xl bg-primary">
              <ActivityIndicator color="#000" />
            </View>
          ) : (
            <Button label="Continue" variant="primary" onPress={onSubmit} />
          )}

          <TouchableOpacity
            disabled={submitting}
            onPress={() => router.push("/signup")}
          >
            <Text className="mt-1 text-center text-[11px] text-muted-light dark:text-muted-dark">
              Don’t have an account?{" "}
              <Text className="font-semibold text-primary">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
