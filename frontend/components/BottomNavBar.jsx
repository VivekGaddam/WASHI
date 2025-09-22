import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNavBar({ activeTab, setActiveTab }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("Home")}>
        <Ionicons
          name="home-outline"
          size={24}
          color={activeTab === "Home" ? "#6C63FF" : "gray"}
        />
        <Text style={[styles.label, activeTab === "Home" && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("CreatePost")}>
        <Ionicons
          name="add-circle-outline"
          size={24}
          color={activeTab === "CreatePost" ? "#6C63FF" : "gray"}
        />
        <Text style={[styles.label, activeTab === "CreatePost" && styles.activeLabel]}>
          Create Post
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("Profile")}>
        <Ionicons
          name="person-outline"
          size={24}
          color={activeTab === "Profile" ? "#6C63FF" : "gray"}
        />
        <Text style={[styles.label, activeTab === "Profile" && styles.activeLabel]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: { justifyContent: "center", alignItems: "center" },
  label: { fontSize: 12, color: "gray", marginTop: 2 },
  activeLabel: { color: "#6C63FF", fontWeight: "bold" },
});
