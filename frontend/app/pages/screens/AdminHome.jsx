// AdminHome.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AdminProfile from '../../admin/AdminProfile';
import AdminExplore from '../../admin/AdminExplore';
import AdminReports from '../../admin/AdminReports';
import ReportDetails from '../../admin/ReportDetails';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminReports" component={AdminReports} />
      <Stack.Screen name="ReportDetails" component={ReportDetails} />
    </Stack.Navigator>
  );
}

export default function AdminHome() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'Profile') iconName = 'person-circle';
          else if (route.name === 'Explore') iconName = 'compass-outline';
          else if (route.name === 'Reports') iconName = 'document-text-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2a448c',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Profile" component={AdminProfile} />
      <Tab.Screen name="Explore" component={AdminExplore} />
      <Tab.Screen name="Reports" component={ReportsStack} options={{ title: 'Reports' }} />
    </Tab.Navigator>
  );
}
