// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Remove modal if you don’t have it */}
      {/* <Stack.Screen name="modal" /> */}
    </Stack>
  );
}
