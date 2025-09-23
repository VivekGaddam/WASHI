import React, { useEffect, useState, useCallback } from "react";
import { 
  View, StyleSheet, FlatList, Text, ActivityIndicator, 
  TouchableOpacity, RefreshControl, Image, Dimensions
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import MapComponent from "../../components/MapComponent.jsx";
import CommentModal from "../../components/CommentModal.jsx";
import * as Location from "expo-location";
import { API_URL } from "@/config.js";
import { useAuth } from "../../../context/AuthContext.js";
import { authFetch } from "@/utils/authFetch";


const { width } = Dimensions.get('window');

export default function NormalUserHome() {
  const { user } = useAuth();
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mapFullScreen, setMapFullScreen] = useState(false);

  // --- NEW: State for managing the comment modal ---
  const [selectedReport, setSelectedReport] = useState(null);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);

  const fetchFeed = useCallback(async (lat, lng) => {
    try {
      setLoadingFeed(true);
      const res = await authFetch(`${API_URL}/posts/feed?lat=${lat}&lng=${lng}`);
      if(!res.ok) throw new Error("Failed to fetch feed");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Fetch Feed Error:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setCoords({ latitude: 17.3850, longitude: 78.4867 });
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        const newCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(newCoords);
      } catch (err) {
        console.error("Location Error:", err);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (coords) fetchFeed(coords.latitude, coords.longitude);
  }, [coords, fetchFeed]);

  const handleLike = async (reportId) => {
    try {
      const res = await authFetch(`${API_URL}/posts/${reportId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error("Failed to update like status");
      const updatedReport = await res.json();
      setReports(currentReports =>
        currentReports.map(report =>
          report._id === reportId ? updatedReport : report
        )
      );
    } catch (err) {
      console.error("Like Report Error:", err);
    }
  };

  const onRefresh = async () => {
    if (!coords) return;
    setRefreshing(true);
    await fetchFeed(coords.latitude, coords.longitude);
    setRefreshing(false);
  };

  // --- NEW: Function to open the comment modal ---
  const handleOpenComments = (report) => {
    setSelectedReport(report);
    setCommentModalVisible(true);
  };
  
  // --- NEW: Function to close the modal and refresh feed ---
  const handleCloseComments = () => {
    setCommentModalVisible(false);
    setSelectedReport(null);
    if (coords) {
      fetchFeed(coords.latitude, coords.longitude);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Road': 'road', 'Water': 'water-drop', 'Electricity': 'flash', 'Waste': 'delete',
      'Parks': 'park', 'Traffic': 'traffic', 'Health': 'local-hospital',
      'Construction': 'construction', 'Safety': 'security', 'Other': 'report-problem'
    };
    return icons[category] || 'report-problem';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#6BCF7F';
      default: return '#A8A8A8';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9500';
      case 'in-progress': return '#007AFF';
      case 'resolved': return '#34C759';
      case 'closed': return '#8E8E93';
      default: return '#A8A8A8';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item, index }) => {
    const isLiked = user && item.likes.includes(user._id);
    return (
      <View style={[styles.postCard, { marginTop: index === 0 ? 160 : 0 }]}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.categoryContainer}>
            <MaterialIcons name={getCategoryIcon(item.category)} size={16} color="#007AFF" />
            <Text style={styles.categoryText}>r/{item.category}</Text>
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.metaText}>Posted by u/{item.user?.username || 'citizen'} • {formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{item.title}</Text>
          {item.description && <Text style={styles.postDescription} numberOfLines={3}>{item.description}</Text>}
        </View>

        {/* Status & Priority Tags */}
        <View style={styles.tagsContainer}>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.tagText}>{item.status}</Text>
          </View>
          <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.tagText}>{item.priority} Priority</Text>
          </View>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
            <Ionicons name={isLiked ? "arrow-up-circle" : "arrow-up"} size={20} color={isLiked ? "#007AFF" : "#8E8E93"} />
            <Text style={[styles.actionText, isLiked && { color: "#007AFF" }]}>{item.likeCount || 0}</Text>
          </TouchableOpacity>
          
          {/* --- MODIFIED: Comment button now opens the modal --- */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenComments(item)}>
            <Ionicons name="chatbubble-outline" size={18} color="#8E8E93" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={18} color="#8E8E93" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="location-on" size={18} color="#8E8E93" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=Community&background=007AFF&color=fff` }} 
            style={styles.communityAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Reports</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
        ListEmptyComponent={() => (!loadingFeed && <View style={styles.emptyContainer}><MaterialIcons name="inbox" size={64} color="#C7C7CC" /><Text style={styles.emptyTitle}>No reports in your area</Text><Text style={styles.emptySubtitle}>Be the first to report an issue</Text></View>)}
        ListFooterComponent={() => (loadingFeed && <View style={styles.loadingFooter}><ActivityIndicator size="small" color="#007AFF" /><Text style={styles.loadingFooterText}>Loading...</Text></View>)}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Floating Map */}
      {coords && (
        <MapComponent
          coords={coords}
          isFullScreen={mapFullScreen}
          setIsFullScreen={setMapFullScreen}
        />
      )}

      {/* Comment Modal */}
      {selectedReport && (
        <CommentModal 
          report={selectedReport}
          visible={isCommentModalVisible}
          onClose={handleCloseComments}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: "white", flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, zIndex: 100, borderBottomWidth: 0.5, borderBottomColor: "#C7C7CC", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  communityAvatar: { width: 32, height: 32, borderRadius: 16 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  feedContainer: { paddingBottom: 100 },
  postCard: { backgroundColor: "white", marginHorizontal: 0, marginBottom: 8, paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: 0.5, borderTopColor: "#E5E5EA", borderBottomWidth: 0.5, borderBottomColor: "#E5E5EA" },
  postHeader: { marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  categoryText: { fontSize: 13, fontWeight: "600", color: "#007AFF", marginLeft: 4 },
  postMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: "#8E8E93" },
  postContent: { marginBottom: 12 },
  postTitle: { fontSize: 16, fontWeight: "600", color: "#1C1C1E", lineHeight: 22, marginBottom: 4 },
  postDescription: { fontSize: 14, color: "#3A3A3C", lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: "600", color: "white", textTransform: 'uppercase' },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#E5E5EA" },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: "#F2F2F7", flex: 1, marginHorizontal: 2, justifyContent: 'center' },
  actionText: { fontSize: 12, color: "#8E8E93", fontWeight: "600", marginLeft: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#F2F2F7" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8E8E93", textAlign: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 100, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#1C1C1E", marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: "#8E8E93", textAlign: 'center', lineHeight: 22 },
  loadingFooter: { paddingVertical: 20, alignItems: 'center' },
  loadingFooterText: { marginTop: 8, fontSize: 14, color: "#8E8E93" },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF", justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
