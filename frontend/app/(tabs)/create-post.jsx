import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config.js";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user location automatically
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required to submit a report.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ longitude: loc.coords.longitude, latitude: loc.coords.latitude });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title || !description || !coords) {
      Alert.alert("Error", "Title, description, and location are required!");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location: {
            type: "Point",
            coordinates: [coords.longitude, coords.latitude],
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Report submitted successfully!");
        setTitle("");
        setDescription("");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit Report"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#111" },
  input: { backgroundColor: "#222", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: "#007bff", padding: 16, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
