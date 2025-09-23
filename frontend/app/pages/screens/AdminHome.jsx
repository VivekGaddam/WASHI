// app/(tabs)/AdminHome.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Image
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config.js";

export default function AdminHome() {
  const [reports, setReports] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin reports
  const fetchReports = async () => {
    try {
      setLoadingFeed(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new": return "#FF9500";
      case "in-progress": return "#007AFF";
      case "resolved": return "#34C759";
      case "closed": return "#8E8E93";
      default: return "#A8A8A8";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#FF6B6B";
      case "medium": return "#FFD93D";
      case "low": return "#6BCF7F";
      default: return "#A8A8A8";
    }
  };

  const renderReport = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.categoryContainer}>
          <MaterialIcons name="report-problem" size={16} color="#007AFF" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.metaText}>
          Posted by {item.user?.fullName || "Unknown"} • {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.tagsContainer}>
        <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.tagText}>{item.status}</Text>
        </View>
        <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.tagText}>{item.priority} Priority</Text>
        </View>
      </View>
    </View>
  );

  if (loadingFeed) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={renderReport}
        contentContainerStyle={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No reports assigned to your department</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  feedContainer: { padding: 16, paddingBottom: 100 },
  postCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: { marginBottom: 8 },
  categoryContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  categoryText: { marginLeft: 4, fontWeight: "600", color: "#007AFF" },
  metaText: { fontSize: 12, color: "#8E8E93" },
  postTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  postDescription: { fontSize: 14, color: "#3A3A3C", lineHeight: 20 },
  tagsContainer: { flexDirection: "row", marginTop: 8, gap: 8 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: "600", color: "white", textTransform: "uppercase" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: "#8E8E93" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1C1C1E", marginTop: 16, textAlign: "center" },
});
