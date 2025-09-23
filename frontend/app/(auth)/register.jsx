import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Platform, Image, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";


export default function Register() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [departments, setDepartments] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  const getBackendURL = () => {
  // Android emulator
  if (Platform.OS === "android") return "http://10.0.2.2:5000";
  // iOS simulator or physical device on same network
  return "http://192.168.1.5:5000";
};

const backendURL = getBackendURL();

const handleRegister = async () => {
    if (!fullName || !email || !password) {
  Alert.alert("Error", "Please fill all required fields");
  return;
}
if (role === "admin") {
  if (!departments || !longitude || !latitude) {
    Alert.alert("Error", "Admin must provide departments and location");
    return;
  }
}

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const payload = { fullName, email, password, role };

    if (role === "admin") {
      if (!departments || !longitude || !latitude) {
        Alert.alert("Error", "Admin must provide departments and location");
        return;
      }
      payload.departments = departments.split(",").map((d) => d.trim());
      payload.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    try {
      const response = await fetch(`${backendURL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        router.replace(role === "admin" ? "/(home)/adminHome" : "/(home)/userHome");
      } else {
        Alert.alert("Registration Failed", data.message || "Try again");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network request failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      {/* Logo */}
      <Image source={require("../../assets/images/logo.jpeg")} style={{ width: 120, height: 120, marginBottom: 20 }} />

      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Register</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

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

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Role Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={{ color: "#fff" }}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>

      {/* Admin fields */}
      {role === "admin" && (
        <>
          <TextInput
            placeholder="Departments (comma separated)"
            placeholderTextColor="#aaa"
            value={departments}
            onChangeText={setDepartments}
            style={styles.input}
          />
          <TextInput
            placeholder="Longitude"
            placeholderTextColor="#aaa"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Latitude"
            placeholderTextColor="#aaa"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
            style={styles.input}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 15 }}>
        <Text style={{ color: "#f00" }}>Go to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#f00",
    width: 300,
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#f00",
    borderRadius: 8,
    width: 300,
    marginVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#222",
  },
  button: {
    backgroundColor: "rgba(218, 66, 66, 1)",
    padding: 15,
    borderRadius: 8,
    width: 300,
    alignItems: "center",
    marginTop: 15,
  },
};
