
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Platform } from "react-native";


export default function Login() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const getBackendURL = () => {
    // Android emulator
    if (Platform.OS === "android") return "http://10.0.2.2:5000";
    // iOS simulator or physical device on same network
    return "http://192.168.1.5:5000";
  };
  
  const backendURL = getBackendURL();

  const handleLogin = async () => {
      if (!email.trim() || !password.trim()) {
    Alert.alert("Error", "This field is required");
    return;
  }
    try {
      const response = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        router.replace(data.user.role === "admin" ? "/(home)/adminHome" : "/(home)/userHome");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/images/logo.jpeg")} style={styles.logo} />

      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 15 }}>
        <Text style={styles.registerText}>Go to Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: "#f00",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#f00",
    width: 300,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    color: "#fff",
  },
  button: {
    backgroundColor: "rgba(235, 82, 82, 1)",
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerText: {
    color: "#f00",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
