import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

const CIVIC_REPORTS = [
  { id: 1, latitude: 17.385, longitude: 78.4867, title: "Pothole on Main Road", description: "Dangerous pothole reported", type: "road" },
  { id: 2, latitude: 17.4065, longitude: 78.4772, title: "Street Light Not Working", description: "Lights off near the market", type: "electric" },
  { id: 3, latitude: 17.3616, longitude: 78.4747, title: "Garbage Overflow", description: "Overflowing garbage bin", type: "sanitation" },
];

const getMarkerIcon = (type) => {
  switch (type) {
    case "road": return "construct-outline";
    case "electric": return "flash-outline";
    case "sanitation": return "trash-outline";
    default: return "alert-circle-outline";
  }
};

const getMarkerColor = (type) => {
  switch (type) {
    case "road": return "#E74C3C";
    case "electric": return "#F1C40F";
    case "sanitation": return "#27AE60";
    default: return "#95A5A6";
  }
};

export default function MapComponent({ coords, isFullScreen, setIsFullScreen }) {
  const [selectedReport, setSelectedReport] = useState(null);

  const renderReportMarker = (report) => (
    <View style={[styles.customMarker, { backgroundColor: getMarkerColor(report.type) }]}>
      <Ionicons name={getMarkerIcon(report.type)} size={20} color="white" />
    </View>
  );

  return (
    <View style={isFullScreen ? StyleSheet.absoluteFill : styles.floatingMapContainer}>
      <MapView
        style={isFullScreen ? StyleSheet.absoluteFill : styles.floatingMap}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: isFullScreen ? 0.08 : 0.01,
          longitudeDelta: isFullScreen ? 0.08 : 0.01,
        }}
        showsUserLocation
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

      {/* Fullscreen toggle */}
      {!isFullScreen && (
        <TouchableOpacity style={styles.expandButton} onPress={() => setIsFullScreen(true)}>
          <Text style={styles.expandText}>Expand Map</Text>
        </TouchableOpacity>
      )}

      {isFullScreen && (
        <TouchableOpacity style={styles.backButton} onPress={() => setIsFullScreen(false)}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
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
  floatingMapContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  floatingMap: {
    width: "100%",
    height: "100%",
  },
  expandButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#6C63FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expandText: { color: "#fff", fontWeight: "bold" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 20,
  },
  customMarker: { padding: 6, borderRadius: 6 },
  infoPanel: {
    position: "absolute",
    bottom: 240,
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
