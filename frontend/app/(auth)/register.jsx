import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth(); // Should be register, but for now it's fine

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Register Screen</Text>
      <Button title="Register" onPress={() => login()} />
      <Button title="Go to Login" onPress={() => router.back()} />
    </View>
  );
}
