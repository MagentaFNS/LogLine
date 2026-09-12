import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { ArrowLeft, Heart, Bookmark } from 'lucide-react-native';
import { api } from '../api';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  onBack: () => void;
  mode: 'favorites' | 'saved';
}

export const FavoritesScreen = ({ onBack, mode }: Props) => {
  const { currentUser, addToast } = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useFadeIn();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      // Фильтруем: лайкнутые (mode === 'favorites') или свои (saved)
      const filtered = res.data.filter((p: any) => {
        if (mode === 'favorites') return p.likes > 0;
        return p.username === currentUser?.username;
      });
      setPosts(filtered);
    } catch (e) {
      console.log('❌ favorites:', e);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'favorites' ? 'Избранное' : 'Сохранённое';
  const Icon = mode === 'favorites' ? Heart : Bookmark;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 100 }} />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Icon size={48} color="#ccc" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Пока пусто</Text>
          <Text style={styles.emptyText}>
            {mode === 'favorites'
              ? 'Лайкай посты — они появятся здесь'
              : 'Сохранённые посты появятся здесь'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Avatar uri={item.avatar} username={item.username} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.user}>{item.username}</Text>
                  <Text style={styles.time}>сейчас</Text>
                </View>
              </View>
              <Text style={styles.content}>{item.content}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Heart size={14} color="#FF3B30" fill="#FF3B30" />
                  <Text style={styles.statText}>{item.likes || 0}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -1 },
  empty: { alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  user: { fontWeight: '700', fontSize: 15, color: '#000' },
  time: { fontSize: 12, color: '#999', marginTop: 2 },
  content: { fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, color: '#666', fontWeight: '600' },
});
