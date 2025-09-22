import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import axios from "axios";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://YOUR_SERVER_IP:5000/api/auth/login", {
        email,
        password,
      });
      Alert.alert("Success", `Welcome ${res.data.user.fullName}`);
      if (onLogin) onLogin(res.data); // optional callback
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  heading: { fontSize: 18, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
});
