import { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  Animated, TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Plus, X, Send, Camera } from 'lucide-react-native';
import { api } from '../api';
import { COLORS, RADIUS, SPACING } from '../config';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { Header } from '../components/Header';
import { AnimatedPressable } from '../components/AnimatedPressable';

export const HomeScreen = () => {
  const { currentUser } = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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
      fetchPosts();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось создать пост');
    }
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

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLiked = likedPosts.includes(item.id);
            return (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Avatar uri={item.avatar} username={item.username} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postUser}>{item.username}</Text>
                    <Text style={styles.postTime}>сейчас</Text>
                  </View>
                </View>

                <Text style={styles.postContent}>{item.content}</Text>

                <View style={styles.postFooter}>
                  <TouchableOpacity style={styles.actionRow} onPress={() => toggleLike(item.id)}>
                    <Heart
                      size={18}
                      color={isLiked ? COLORS.danger : COLORS.gray600}
                      fill={isLiked ? COLORS.danger : 'transparent'}
                      strokeWidth={2}
                    />
                    <Text style={[styles.actionText, isLiked && { color: COLORS.danger }]}>
                      {item.likes || 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionRow}>
                    <MessageCircle size={18} color={COLORS.gray600} strokeWidth={2} />
                    <Text style={styles.actionText}>0</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Пока пусто</Text>
              <Text style={styles.emptyText}>Нажми + внизу справа</Text>
            </View>
          }
        />
      </Animated.View>

      <AnimatedPressable onPress={() => setModalVisible(true)} style={styles.fab}>
        <LinearGradient colors={['#000000', '#2C2C2E']} style={styles.fabGradient}>
          <Plus size={28} color={COLORS.white} strokeWidth={2.5} />
        </LinearGradient>
      </AnimatedPressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новый пост</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Что у тебя нового?"
              placeholderTextColor={COLORS.gray400}
              value={newPost}
              onChangeText={setNewPost}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Camera size={20} color={COLORS.gray600} strokeWidth={2} />
              </TouchableOpacity>
              <AnimatedPressable onPress={createPost} style={styles.publishBtn}>
                <Send size={18} color={COLORS.white} strokeWidth={2.5} />
                <Text style={styles.publishText}>Опубликовать</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  postCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.md },
  postUser: { fontWeight: '700', fontSize: 15, color: COLORS.black },
  postTime: { fontSize: 12, color: COLORS.gray400, marginTop: 1 },
  postContent: { fontSize: 15, color: COLORS.gray900, lineHeight: 22, marginBottom: SPACING.md },
  postFooter: {
    flexDirection: 'row', gap: SPACING.xl,
    paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: COLORS.gray600, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray800, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.gray500, textAlign: 'center' },
  fab: {
    position: 'absolute', right: 20, bottom: 110,
    width: 60, height: 60, borderRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl, paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.gray300, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  modalInput: {
    backgroundColor: COLORS.gray50, borderRadius: RADIUS.lg,
    padding: SPACING.lg, fontSize: 16, minHeight: 120,
    textAlignVertical: 'top', marginBottom: SPACING.lg, color: COLORS.black,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center',
  },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.black, paddingHorizontal: SPACING.xl,
    paddingVertical: 14, borderRadius: RADIUS.full,
  },
  publishText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
