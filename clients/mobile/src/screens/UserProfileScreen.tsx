import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { CATEGORIES } from '../constants';
import { User } from '../types';

interface Props {
  user: User;
  onBack: () => void;
}

export const UserProfileScreen = ({ user, onBack }: Props) => {
  const { createPrivateChat, chats, openChat, addToast } = useStore();
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/users/${user.id}`)
      .then((res) => setFullUser(res.data))
      .catch(() => setFullUser(user))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleWrite = async () => {
    const chat = await createPrivateChat(user.id);
    if (chat) {
      const full = chats.find((c) => c.id === chat.id);
      if (full) openChat(full);
      addToast(`Чат с ${user.username} открыт`, 'success');
      onBack();
    }
  };

  const u = fullUser || user;
  const categoryLabel = CATEGORIES.find((c) => c.id === u.category)?.label;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <Avatar uri={u.avatar} username={u.username} size={120} />
        </View>
        <Text style={styles.name}>{u.username}</Text>
        <Text style={styles.id}>#{u.id}</Text>

        {categoryLabel && (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {u.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О себе</Text>
          <Text style={styles.bio}>{u.bio}</Text>
        </View>
      )}

      {/* Write Button */}
      <TouchableOpacity style={styles.writeBtn} onPress={handleWrite}>
        <MessageCircle size={18} color="#fff" />
        <Text style={styles.writeText}>Написать сообщение</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    paddingVertical: 32, paddingHorizontal: 24,
    alignItems: 'center', marginHorizontal: 16, marginTop: 8,
  },
  avatarWrap: { marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  id: { fontSize: 13, color: '#999', marginTop: 4 },
  categoryPill: {
    marginTop: 12, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: '#F2F2F7', borderRadius: 999,
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#666' },
  section: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginHorizontal: 16, marginTop: 16,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  bio: { fontSize: 15, color: '#333', lineHeight: 22 },
  writeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#000', paddingVertical: 16,
    marginHorizontal: 16, marginTop: 20, borderRadius: 16,
  },
  writeText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
