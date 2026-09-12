import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { Plus, X, Send, Camera } from 'lucide-react-native';
import { api } from '../api';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { Header } from '../components/Header';
import { AnimatedPost } from '../components/AnimatedPost';

export const HomeScreen = () => {
  const { currentUser, addToast } = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    try {
      await api.post('/posts', { content: newPost });
      setNewPost('');
      setModalVisible(false);
      addToast('Пост опубликован', 'success');
      fetchPosts();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось создать пост');
    }
  };

  const deletePost = (id: number) => {
    Alert.alert('Удалить пост?', '', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/posts/${id}`);
            addToast('Пост удалён', 'success');
            fetchPosts();
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const toggleLike = async (id: number) => {
    const isLiked = likedPosts.includes(id);
    try {
      await api.post(`/posts/${id}/${isLiked ? 'unlike' : 'like'}`);
      setLikedPosts((prev) => (isLiked ? prev.filter((x) => x !== id) : [...prev, id]));
      fetchPosts();
    } catch (e) { console.log(e); }
  };

  return (
    <View style={styles.container}>
      <Header />

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isLiked = likedPosts.includes(item.id);
          const isMine = item.username === currentUser?.username;
          return (
            <AnimatedPost
              item={item}
              isLiked={isLiked}
              isMine={isMine}
              onLike={() => toggleLike(item.id)}
              onDelete={() => deletePost(item.id)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Пока пусто</Text>
            <Text style={styles.emptyText}>Создай первый пост</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новый пост</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Что у тебя нового?"
              placeholderTextColor="#999"
              value={newPost}
              onChangeText={setNewPost}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Camera size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.publishBtn} onPress={createPost}>
                <Send size={16} color="#fff" />
                <Text style={styles.publishText}>Опубликовать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#666' },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4 },
  fab: {
    position: 'absolute', right: 20, bottom: 110,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalInput: {
    backgroundColor: '#f5f5f7', borderRadius: 16,
    padding: 16, fontSize: 16, minHeight: 120,
    textAlignVertical: 'top', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f7', justifyContent: 'center', alignItems: 'center' },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24,
  },
  publishText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
