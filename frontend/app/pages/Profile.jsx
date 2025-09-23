import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

export default function Profile() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setUserData(data.user);
        setReports(data.reports || []); // <-- use reports
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchProfile();
  }, [user?.token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0079D3" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.noDataText}>No profile data found</Text>
      </View>
    );
  }

  const renderReportCard = ({ item }) => (
    <View style={styles.postContainer}>
      {/* Left section (like Reddit's vote area) */}
      <View style={styles.leftSection}>
        <View style={styles.votePlaceholder}>
          <Text style={styles.voteIcon}>↑</Text>
          <Text style={styles.voteCount}>•</Text>
          <Text style={styles.voteIcon}>↓</Text>
        </View>
      </View>

      {/* Content section */}
      <View style={styles.contentSection}>
        {/* Post header */}
        <View style={styles.postHeader}>
          <Text style={styles.subredditText}>r/cityreports</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timeText}>by you</Text>
        </View>

        {/* Title */}
        <Text style={styles.postTitle}>{item.title}</Text>
        
        {/* Description */}
        <Text style={styles.postText}>{item.description}</Text>

        {/* Status and Priority tags */}
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
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.header}>Profile</Text>
        
        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <Text style={styles.username}>u/{userData.username}</Text>
          <View style={styles.userDetails}>
            <Text style={styles.detailText}>Email: {userData.email}</Text>
            <Text style={styles.detailText}>Role: {userData.role}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* My Reports Section */}
      <View style={styles.reportsSection}>
        <Text style={styles.subHeader}>My Reports</Text>
        
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reports yet.</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item._id}
            renderItem={renderReportCard}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingLeft: 20,  
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noDataText: {
    fontSize: 16,
    color: '#7C7C7C',
  },

  // Profile Header Section
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFF1',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1C1C1C',
  },
  userInfoCard: {
    backgroundColor: '#F6F7F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0079D3',
    marginBottom: 8,
  },
  userDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#1C1C1C',
    marginBottom: 2,
  },
  logoutButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Reports Section
  reportsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 16,
    color: '#1C1C1C',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7C7C7C',
  },

  // Post Cards (same as explore)
  postContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  // Left section (like Reddit's vote area)
  leftSection: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  votePlaceholder: {
    alignItems: 'center',
  },
  voteIcon: {
    fontSize: 16,
    color: '#C8CBCD',
    fontWeight: 'bold',
  },
  voteCount: {
    fontSize: 12,
    color: '#C8CBCD',
    marginVertical: 2,
  },

  // Content section
  contentSection: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subredditText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
  dot: {
    fontSize: 12,
    color: '#7C7C7C',
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#7C7C7C',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 6,
    lineHeight: 22,
  },
  postText: {
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusTag: {
    backgroundColor: '#F6F7F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityTag: {
    backgroundColor: '#F6F7F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#EDEFF1',
    marginLeft: 60, // Offset for the voting section like Reddit
  },
});