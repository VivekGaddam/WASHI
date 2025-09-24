import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config.js";

const { width } = Dimensions.get('window');

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Get user location automatically
  useEffect(() => {
    (async () => {
      try {
        setLocationLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Location permission is required to submit a report.");
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ 
          longitude: loc.coords.longitude, 
          latitude: loc.coords.latitude 
        });
      } catch (err) {
        console.error("Location error:", err);
        Alert.alert("Location Error", "Unable to get your current location.");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a title for your report.");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Missing Information", "Please provide a description of the issue.");
      return false;
    }
    if (!coords) {
      Alert.alert("Location Required", "Location information is required to submit the report.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const postData = {
        title: title.trim(),
        description: description.trim(),
        location: {
          type: "Point",
          coordinates: [coords.longitude, coords.latitude],
        },
        // Category, priority, and image are handled by backend AI
      };

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          "Success",
          "Your report has been submitted successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                setTitle("");
                setDescription("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Submission Failed", data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Network Error", "Unable to submit report. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          style={styles.postButton} 
          onPress={handleSubmit}
          disabled={loading || !title.trim() || !description.trim()}
        >
          <Text style={[
            styles.postButtonText, 
            (!title.trim() || !description.trim()) && styles.disabledText
          ]}>
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="What's the issue?"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            multiline
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Description Input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Provide more details about the issue..."
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </View>

        {/* Location Info */}
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>
            📍 Current location will be used
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C7C7CC",
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  postButton: {
    alignItems: 'flex-end',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  disabledText: {
    color: "#C7C7CC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  communitySection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  selectorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  required: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedText: {
    fontSize: 15,
    color: "#1C1C1E",
    marginLeft: 8,
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 15,
    color: "#C7C7CC",
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  inputCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  titleInput: {
    fontSize: 16,
    color: "#1C1C1E",
    minHeight: 50,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontSize: 15,
    color: "#1C1C1E",
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: 'right',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  selectedImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addImageText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#34C759",
  },
  locationError: {
    fontSize: 14,
    color: "#FF3B30",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  modalContent: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F7",
  },
  selectedModalOption: {
    backgroundColor: "#F0F9FF",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1C1C1E",
    marginLeft: 12,
    flex: 1,
  },
  priorityInfo: {
    flex: 1,
    marginLeft: 4,
  },
  priorityDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  imageOptionsModal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  imageOptionText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 12,
  },
  cancelButton: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: 'center',
  },
});