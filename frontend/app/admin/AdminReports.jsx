// AdminReports.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
  RefreshControl, Picker // if using @react-native-picker/picker; else use custom buttons
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config.js';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReports({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('latest'); // latest | oldest
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [page, setPage] = useState(1);

  const buildUrl = () => {
    const params = new URLSearchParams();
    params.append('limit', 50);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (selectedDept) params.append('department', selectedDept);
    // backend supports page, limit already
    return `${API_URL}/reports?${params.toString()}`;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const url = buildUrl();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const data = json.data || json;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const data = json.data || json;
      setDepartments(Array.isArray(data) ? data : []);
      // optionally set default selected dept based on admin profile (if available)
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchReports();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, priorityFilter, selectedDept]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ReportDetails', { reportId: item._id })}>
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
      {/* Filters */}
      <View style={styles.filtersRow}>
        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterButtons}>
            {['', 'New', 'In Progress', 'Resolved', 'Closed'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s)}
                style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, statusFilter === s && { color: '#fff' }]}>{s || 'All'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Priority</Text>
          <View style={styles.filterButtons}>
            {['', 'High', 'Medium', 'Low'].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriorityFilter(p)}
                style={[styles.filterBtn, priorityFilter === p && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, priorityFilter === p && { color: '#fff' }]}>{p || 'All'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </View>

      {/* List */}
      {loading ? (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding:12, paddingBottom:120 }}
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
  filtersRow:{ padding:12 },
  filterBox:{ marginBottom:12 },
  filterLabel:{ fontWeight:'700', color:'#1C1C1E', marginBottom:8 },
  filterButtons:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  filterBtn:{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'white', borderRadius:8, marginRight:8, marginBottom:8, elevation:2 },
  filterBtnActive:{ backgroundColor:'#2a448c' },
  filterBtnText:{ color:'#1C1C1E', fontWeight:'600' },
  deptBox:{ marginTop:8 },
  deptRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  deptBtn:{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'white', borderRadius:8, marginRight:8, elevation:2 },
  card:{ backgroundColor:'white', padding:12, borderRadius:10, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 },
  title:{ fontSize:16, fontWeight:'700', color:'#1C1C1E' },
  sub:{ color:'#6B6B6B', marginTop:4 },
  desc:{ color:'#3A3A3C', marginTop:8 },
  metaRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  time:{ fontSize:12, color:'#8E8E93' },
  metaDept:{ fontSize:12, color:'#8E8E93' },
  status:{ paddingHorizontal:8, paddingVertical:4, borderRadius:12, color:'#fff', fontWeight:'700', textTransform:'uppercase', fontSize:12 }
});