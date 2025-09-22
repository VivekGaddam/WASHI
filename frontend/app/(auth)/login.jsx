import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={() => login()} />
      <Button title="Go to Register" onPress={() => router.push("/(auth)/register")} />
    </View>
  );
}
