import React, { useState } from "react";
import { View, StyleSheet,ScrollView } from "react-native";
import MapComponent from "../../components/MapComponent";
import BottomNavBar from "../../components/BottomNavBar";
import CreatePost from "./CreatePost";
import Profile from "./Profile";
import RegisterForm from "../../components/RegisterForm"; 
import LoginForm from "../../components/LoginForm";      

export default function Home() {
  const [activeTab, setActiveTab] = useState("Home");

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <MapComponent />;
      case "CreatePost":
        return <CreatePost />;
      case "Profile":
        return <Profile />;
      default:
        return (
          <ScrollView contentContainerStyle={{ padding: 10 }}>
            <MapComponent />
            <RegisterForm />
            <LoginForm />
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 }, // important: content takes remaining space above navbar
});
