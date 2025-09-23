import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, Modal, FlatList, TextInput, 
    TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

const CommentModal = ({ report, visible, onClose }) => {
  if (!report) return null;

  const { token } = useAuth();
  const [comments, setComments] = useState(report.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // When the modal opens with a new report, reset the comments
  useEffect(() => {
    setComments(report.comments || []);
  }, [report]);

  const handlePostComment = async () => {
    if (newComment.trim() === '') return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts/${report._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const postedComment = await response.json();
      
      // Add the new comment to the top of the list for immediate feedback
      setComments(prevComments => [postedComment, ...prevComments]);
      setNewComment(''); // Clear the input field

    } catch (error) {
      console.error("Post Comment Error:", error);
      // Alert.alert("Error", "Could not post your comment.");
    } finally {
      setLoading(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentUser}>{item.user?.username || 'User'}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#ccc" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{report.title}</Text>
            
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id || Math.random().toString()}
              style={styles.commentList}
              ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first!</Text>}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity style={styles.postButton} onPress={handlePostComment} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    flexOne: { flex: 1 },
    centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { 
        height: '85%',
        backgroundColor: 'white', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
        padding: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5 
    },
    closeButton: { position: 'absolute', top: 15, right: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    commentList: { flex: 1, width: '100%' },
    commentContainer: { backgroundColor: '#f2f2f7', padding: 10, borderRadius: 8, marginBottom: 10 },
    commentUser: { fontWeight: 'bold', marginBottom: 4 },
    commentText: {},
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 10 },
    input: { flex: 1, backgroundColor: '#f2f2f7', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, minHeight: 40 },
    postButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 20 },
});

export default CommentModal;