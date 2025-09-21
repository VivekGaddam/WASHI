import React, { useState } from "react";
import { Button, Image, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

export default function App() {
  const [image, setImage] = useState(null);

  // pick from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // capture from camera
  const takePhoto = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Camera permission required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="📂 Pick from Gallery" onPress={pickImage} />
      <Button title="📸 Take a Photo" onPress={takePhoto} />

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0f0f0",
  },
  image: {
    marginTop: 20,
    width: 300,
    height: 400,
    borderRadius: 10,
  },
});
