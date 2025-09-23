// app/(tabs)/explore.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { API_URL } from "../../config";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/reports/all?`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      if (status) url += `status=${encodeURIComponent(status)}&`;
      const res = await fetch(url);
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const renderReportCard = ({ item }) => (
    <View style={styles.postContainer}>
      {/* Left section */}
      <View style={styles.leftSection}>
        <View style={styles.votePlaceholder}>
          <Text style={styles.voteIcon}>↑</Text>
          <Text style={styles.voteCount}>•</Text>
          <Text style={styles.voteIcon}>↓</Text>
        </View>
      </View>

      {/* Right section */}
      <View style={styles.contentSection}>
        <View style={styles.postHeader}>
          <Text style={styles.subredditText}>r/cityreports</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timeText}>2h ago</Text>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postText}>{item.description}</Text>

        <View style={styles.tagsRow}>
          <View style={styles.statusTag}>
            <Text style={styles.tagText}>Status: {item.status}</Text>
          </View>
          <View style={styles.priorityTag}>
            <Text style={styles.tagText}>Priority: {item.priority}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Explore Reports</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchReports}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, category && styles.activeFilterButton]}
          onPress={() => setCategory(category ? "" : "Sanitation Department")}
        >
          <Text
            style={[
              styles.filterButtonText,
              category && styles.activeFilterButtonText,
            ]}
          >
            Sanitation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, status && styles.activeFilterButton]}
          onPress={() => setStatus(status ? "" : "New")}
        >
          <Text
            style={[
              styles.filterButtonText,
              status && styles.activeFilterButtonText,
            ]}
          >
            New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading or List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderReportCard}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingLeft: 20,
    backgroundColor: "#F2F2F7",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 16,
    paddingHorizontal: 0,
    color: "#1C1C1E",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: "#EDEFF1",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#1C1C1E",
  },
  searchButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 18,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Filters
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEFF1",
    backgroundColor: "#FFFFFF",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#7C7C7C",
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Post card
  postContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  votePlaceholder: {
    alignItems: "center",
  },
  voteIcon: {
    fontSize: 16,
    color: "#C8CBCD",
    fontWeight: "bold",
  },
  voteCount: {
    fontSize: 12,
    color: "#C8CBCD",
    marginVertical: 2,
  },
  contentSection: {
    flex: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  subredditText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  dot: {
    fontSize: 12,
    color: "#7C7C7C",
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#7C7C7C",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 6,
    lineHeight: 22,
  },
  postText: {
    fontSize: 14,
    color: "#1C1C1E",
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusTag: {
    backgroundColor: "#F6F7F8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityTag: {
    backgroundColor: "#F6F7F8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#7C7C7C",
    fontWeight: "500",
  },
});

export default Explore;
