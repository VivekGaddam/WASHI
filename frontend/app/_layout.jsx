import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (rootNavigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [rootNavigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;
    
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, isNavigationReady]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}