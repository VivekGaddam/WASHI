// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // hide the header too
        }}
      />
    </Stack>
  );
}
