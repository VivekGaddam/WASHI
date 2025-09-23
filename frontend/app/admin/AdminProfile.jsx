// AdminProfile.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config.js';
import { Ionicons } from '@expo/vector-icons';

export default function AdminProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    // navigate to auth/login flow; adjust as per your app
    navigation.replace('Auth'); // ensure this route exists in your root navigator
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Unable to load profile</Text>
        <TouchableOpacity style={styles.button} onPress={fetchProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="person-circle" size={72} color="#2a448c" />
        <Text style={styles.name}>{profile.fullName || profile.username}</Text>
        <Text style={styles.sub}>{profile.email}</Text>
        <Text style={styles.sub}>Role: {profile.role}</Text>
        <Text style={styles.sub}>
          Departments: {profile.departments?.length ? profile.departments.map(d => d.name).join(', ') : '—'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={20} color="#1C1C1E" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, { backgroundColor: '#FF3B30', marginTop: 8 }]}
          onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: handleLogout }
          ])}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={[styles.actionText, { color: '#fff' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F2F2F7', paddingTop:24 },
  center:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#F2F2F7' },
  card:{ backgroundColor:'white', margin:16, padding:20, borderRadius:12, alignItems:'center', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, elevation:4 },
  name:{ fontSize:20, fontWeight:'700', marginTop:8, color:'#1C1C1E' },
  sub:{ marginTop:6, color:'#6B6B6B' },
  action:{ flexDirection:'row', alignItems:'center', padding:14, backgroundColor:'white', borderRadius:10, marginTop:12, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, elevation:2 },
  actionText:{ marginLeft:12, fontWeight:'600', color:'#1C1C1E' },
  title:{ fontSize:16, fontWeight:'600' },
  button:{ marginTop:12, padding:10, backgroundColor:'#007AFF', borderRadius:8 },
  buttonText:{ color:'#fff', fontWeight:'600' }
});
