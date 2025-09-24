// app/pages/screens/UserHome.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import NormalUserHome from "./NormalUserHome";
import CreatePost from "../../user/create-post";
import Explore from "../../user/explore";
import Profile from "../../user/profile";

const Tab = createBottomTabNavigator();

export default function UserHome() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          position: "absolute",
          bottom: 10,         // 👈 lift bar up
          left: 10,
          right: 10,
          backgroundColor: "white",
          borderRadius: 20,   // rounded floating look
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 5,       // shadow for Android
          shadowColor: "#000",
          shadowOpacity: 0.1, // shadow for iOS
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Create Post") {
            iconName = "add-circle-outline";
          } else if (route.name === "Explore") {
            iconName = "compass-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={NormalUserHome} />
      <Tab.Screen name="Create Post" component={CreatePost} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
