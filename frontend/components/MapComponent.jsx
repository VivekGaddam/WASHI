// components/MapComponent.jsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

// Example civic reports
const CIVIC_REPORTS = [
  { id: 1, latitude: 17.3850, longitude: 78.4867, title: "Pothole on Main Road", description: "Dangerous pothole reported", type: "road" },
  { id: 2, latitude: 17.4065, longitude: 78.4772, title: "Street Light Not Working", description: "Lights off near the market", type: "electric" },
  { id: 3, latitude: 17.3616, longitude: 78.4747, title: "Garbage Overflow", description: "Overflowing garbage bin", type: "sanitation" },
];

// Marker icons
const getMarkerIcon = (type) => {
  switch (type) {
    case "road": return "construct-outline";
    case "electric": return "flash-outline";
    case "sanitation": return "trash-outline";
    default: return "alert-circle-outline";
  }
};

// Marker colors
const getMarkerColor = (type) => {
  switch (type) {
    case "road": return "#E74C3C";
    case "electric": return "#F1C40F";
    case "sanitation": return "#27AE60";
    default: return "#95A5A6";
  }
};

export default function MapComponent() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Enable location to center the map.",
          [{ text: "OK", onPress: () => setLoading(false) }]
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc.coords);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch your location.");
      setLoading(false);
    }
  };

  const renderReportMarker = (report) => (
    <View style={[styles.customMarker, { backgroundColor: getMarkerColor(report.type) }]}>
      <Ionicons name={getMarkerIcon(report.type)} size={20} color="white" />
    </View>
  );

  if (loading && !location) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <Ionicons name="location-outline" size={48} color="#6C63FF" />
          <Text style={styles.loaderText}>Finding your location...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Civic Reports</Text>

      {/* Fullscreen Map */}
      {isFullScreen && location && (
        <>
          <MapView
            style={styles.fullMap}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
          >
            {CIVIC_REPORTS.map((report) => (
              <Marker
                key={report.id}
                coordinate={{ latitude: report.latitude, longitude: report.longitude }}
                title={report.title}
                description={report.description}
                onPress={() => setSelectedReport(report)}
              >
                {renderReportMarker(report)}
              </Marker>
            ))}
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsFullScreen(false)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* Small map preview */}
      {!isFullScreen && location && (
        <TouchableOpacity style={styles.smallMapContainer} onPress={() => setIsFullScreen(true)}>
          <MapView
            style={styles.smallMap}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            showsUserLocation={true}
          />
          <Text style={styles.smallMapText}>Tap to expand</Text>
        </TouchableOpacity>
      )}

      {/* Info Panel */}
      {selectedReport && (
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <Ionicons name={getMarkerIcon(selectedReport.type)} size={24} color={getMarkerColor(selectedReport.type)} />
            <Text style={styles.infoPanelTitle}>{selectedReport.title}</Text>
            <TouchableOpacity onPress={() => setSelectedReport(null)}>
              <Ionicons name="close" size={24} color="#95A5A6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoPanelDescription}>{selectedReport.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerTitle: { fontSize: 22, fontWeight: "bold", margin: 16 },
  fullMap: { width: "100%", height: "100%" },
  smallMapContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  smallMap: { width: "100%", height: "100%" },
  smallMapText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closeButton: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderContent: { justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16, color: "#6C63FF" },
  customMarker: { padding: 6, borderRadius: 6 },
  infoPanel: {
    position: "absolute",
    bottom: 180,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoPanelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  infoPanelTitle: { flex: 1, marginLeft: 8, fontWeight: "bold", fontSize: 16 },
  infoPanelDescription: { fontSize: 14, color: "#555" },
});
