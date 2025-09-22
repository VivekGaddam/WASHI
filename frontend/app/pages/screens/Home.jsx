import React from "react";
import { View, StyleSheet } from "react-native";
import MapComponent from "../../components/MapComponent.jsx";

export default function Home() {
  return (
    <View style={styles.container}>
      <MapComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
