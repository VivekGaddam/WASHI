// ReportDetails.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  TextInput, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config.js';
import { Ionicons } from '@expo/vector-icons';
import MapComponent from '../components/MapComponent.jsx'; // reuse your existing MapComponent

export default function ReportDetails({ route, navigation }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || json;
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const changeStatus = async (newStatus) => {
    if (!report) return;
    Alert.alert('Change Status', `Change status to "${newStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes', onPress: async () => {
          try {
            setUpdating(true);
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API_URL}/reports/${reportId}/status`, {
              method: 'PUT', // your backend uses PUT
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || 'Failed to update status');
            }
            const updated = await res.json();
            setReport(updated);
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not update status');
            console.error(err);
          } finally {
            setUpdating(false);
          }
        }
      }
    ]);
  };

  const addNote = async () => {
    if (!noteText.trim()) return Alert.alert('Note required', 'Enter some text before adding a note.');
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/reports/${reportId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: noteText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add note');
      }
      const newNote = await res.json();
      // Option A: re-fetch report to populate notes; simpler
      await fetchReport();
      setNoteText('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add note');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize:16 }}>Report not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.sub}>{report.category} • {report.priority}</Text>
        <Text style={styles.desc}>{report.description}</Text>

        <View style={{ marginTop:12 }}>
          <Text style={{ fontWeight:'700' }}>Status</Text>
          <View style={{ flexDirection:'row', marginTop:8, gap:8 }}>
            {['New','In Progress','Resolved','Closed','Rejected'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, report.status === s && { backgroundColor:'#2a448c' }]}
                onPress={() => changeStatus(s)}
              >
                <Text style={[styles.statusText, report.status === s && { color:'#fff' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginTop:12 }}>
          <Text style={{ fontWeight:'700' }}>Location</Text>
          {report.location?.coordinates && (
            <View style={{ height:180, marginTop:8, borderRadius:8, overflow:'hidden' }}>
              <MapComponent
                coords={{
                  latitude: report.location.coordinates[1],
                  longitude: report.location.coordinates[0],
                }}
                isFullScreen={false}
                hideControls
              />
            </View>
          )}
        </View>

        {report.images?.length > 0 && (
          <View style={{ marginTop:12 }}>
            <Text style={{ fontWeight:'700' }}>Images</Text>
            {/* Simple list of image URLs; you can replace with Image component / carousel */}
            {report.images.map((img, idx) => (
              <Text key={idx} style={{ color:'#007AFF', marginTop:6 }}>{img}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Notes */}
      <View style={[styles.card, { marginTop:12 }]}>
        <Text style={{ fontWeight:'700', marginBottom:8 }}>Notes</Text>
        {report.notes?.length ? report.notes.map((n) => (
          <View key={n._id || n.createdAt} style={{ marginBottom:10 }}>
            <Text style={{ fontWeight:'600' }}>{n.addedBy?.fullName || n.addedBy?.username || 'Unknown'}</Text>
            <Text style={{ color:'#6B6B6B', marginTop:4 }}>{n.text}</Text>
            <Text style={{ color:'#8E8E93', marginTop:4, fontSize:12 }}>{new Date(n.createdAt).toLocaleString()}</Text>
          </View>
        )) : (<Text style={{ color:'#6B6B6B' }}>No notes yet</Text>)}

        <View style={{ marginTop:12 }}>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add a note..."
            style={{ backgroundColor:'#F2F2F7', padding:10, borderRadius:8 }}
            multiline
          />
          <TouchableOpacity onPress={addNote} style={{ marginTop:8, backgroundColor:'#2a448c', padding:12, borderRadius:8, alignItems:'center' }}>
            {updating ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>Add Note</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F2F2F7' },
  center:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#F2F2F7' },
  card:{ backgroundColor:'white', margin:12, padding:12, borderRadius:10, elevation:2 },
  title:{ fontSize:18, fontWeight:'700', color:'#1C1C1E' },
  sub:{ color:'#6B6B6B', marginTop:6 },
  desc:{ color:'#3A3A3C', marginTop:8, lineHeight:20 },
  statusBtn:{ paddingHorizontal:10, paddingVertical:8, borderRadius:8, backgroundColor:'#F2F2F7', marginRight:8 },
  statusText:{ fontWeight:'700' }
});
