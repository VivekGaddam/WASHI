import React from "react";
import { View, Text } from "react-native";
import MapComponent from "../../components/MapComponent";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: "center", marginTop: 10, fontSize: 20 }}>
        My Map Screen
      </Text>
      <MapComponent />
      
    </View>
  );
}
