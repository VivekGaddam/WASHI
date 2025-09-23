// AdminExplore.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
  RefreshControl, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config.js';
import { Ionicons } from '@expo/vector-icons';

export default function AdminExplore({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // latest | severity
  const [query, setQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      let url = `${API_URL}/reports?limit=50`;
      if (sortBy === 'severity') url += '&sort=priority'; // your backend may handle
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      // either { data: reports } or array depending on endpoint variant
      const data = json.data || json;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const filtered = reports.filter(r =>
    !query || r.title?.toLowerCase().includes(query.toLowerCase()) || r.description?.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReportDetails', { reportId: item._id })}
    >
      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
      <Text style={styles.sub}>{item.category} • {item.priority}</Text>
      <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.metaDept}>{item.assignedDepartment?.name || 'Unassigned'}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    if (!status) return '#A8A8A8';
    const s = status.toLowerCase();
    if (s.includes('new')) return '#FF9500';
    if (s.includes('progress')) return '#007AFF';
    if (s.includes('resolved')) return '#34C759';
    if (s.includes('closed')) return '#8E8E93';
    return '#A8A8A8';
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search reports..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setSortBy(sortBy === 'latest' ? 'severity' : 'latest')}>
          <Ionicons name={sortBy === 'latest' ? 'time-outline' : 'speedometer'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 80, alignItems:'center' }}>
              <Ionicons name="inbox-outline" size={64} color="#C7C7CC" />
              <Text style={{ marginTop: 16, fontSize:16, fontWeight:'600' }}>No reports found</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F2F2F7' },
  searchRow:{ flexDirection:'row', padding:12, gap:8 },
  searchInput:{ flex:1, backgroundColor:'white', borderRadius:8, padding:10, elevation:2 },
  filterBtn:{ width:44, height:44, borderRadius:8, backgroundColor:'#2a448c', justifyContent:'center', alignItems:'center' },
  card:{ backgroundColor:'white', padding:12, borderRadius:10, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 },
  title:{ fontSize:16, fontWeight:'700', color:'#1C1C1E' },
  sub:{ color:'#6B6B6B', marginTop:4 },
  desc:{ color:'#3A3A3C', marginTop:8 },
  metaRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  time:{ fontSize:12, color:'#8E8E93' },
  metaDept:{ fontSize:12, color:'#8E8E93' },
  status:{ paddingHorizontal:8, paddingVertical:4, borderRadius:12, color:'#fff', fontWeight:'700', textTransform:'uppercase', fontSize:12 }
});
