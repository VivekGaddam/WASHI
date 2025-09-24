// app/pages/screens/ReportDetails.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config";
import { Ionicons } from "@expo/vector-icons";

export default function ReportDetails({ route, navigation }) {
  const { reportId } = route.params;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReport(json.data || json);
      setStatus(json.data?.status || json.status);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setStatus(newStatus);
      Alert.alert("Success", "Status updated successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      setAddingNote(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/reports/${reportId}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: noteText }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteText("");
      fetchReport(); // refresh notes
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loading}>
        <Text>Report not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.sub}>
          {report.category} • {report.priority} • {report.status}
        </Text>

        {/* Description */}
        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.desc}>{report.description}</Text>

        {/* Assigned Department */}
        <Text style={styles.sectionHeader}>Assigned Department</Text>
        <Text style={styles.desc}>
          {report.assignedDepartment?.name || "Unassigned"}
        </Text>

        {/* Location */}
        <Text style={styles.sectionHeader}>Location</Text>
        <Text style={styles.desc}>
          Latitude: {report.location.coordinates[1]}, Longitude:{" "}
          {report.location.coordinates[0]}
        </Text>

        {/* Status Update */}
        <Text style={styles.sectionHeader}>Update Status</Text>
        <View style={styles.statusRow}>
          {["New", "In Progress", "Resolved"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                status === s && styles.statusBtnActive,
              ]}
              onPress={() => updateReportStatus(s)}
              disabled={updatingStatus}
            >
              <Text
                style={[
                  styles.statusText,
                  status === s && { color: "#fff", fontWeight: "700" },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.sectionHeader}>Notes</Text>
        {report.notes?.length > 0 ? (
          report.notes.map((note) => (
            <View key={note._id || note.createdAt} style={styles.noteCard}>
              <Text style={styles.noteText}>{note.text}</Text>
              <Text style={styles.noteMeta}>
                {new Date(note.createdAt).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.desc}>No notes yet.</Text>
        )}

        {/* Add Note */}
        <View style={styles.addNoteContainer}>
          <TextInput
            placeholder="Add a note..."
            value={noteText}
            onChangeText={setNoteText}
            style={styles.noteInput}
            multiline
          />
          <TouchableOpacity
            style={styles.addNoteBtn}
            onPress={addNote}
            disabled={addingNote}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F2F2F7" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  sub: { color: "#6B6B6B", marginBottom: 12 },
  sectionHeader: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  desc: { fontSize: 14, color: "#3A3A3C", marginBottom: 8 },
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 8,
  },
  statusBtnActive: { backgroundColor: "#007AFF" },
  statusText: { color: "#1C1C1E" },
  noteCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  noteText: { fontSize: 14, color: "#1C1C1E" },
  noteMeta: { fontSize: 12, color: "#8E8E93", marginTop: 4 },
  addNoteContainer: { flexDirection: "row", marginTop: 12, gap: 8 },
  noteInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 40,
    maxHeight: 100,
  },
  addNoteBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 20,
  },
});
