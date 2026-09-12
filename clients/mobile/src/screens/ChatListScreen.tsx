import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { Chat } from '../types';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  onOpenChat: (chat: Chat) => void;
}

export const ChatListScreen = ({ onOpenChat }: Props) => {
  const { chats, fetchChats } = useStore();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useFadeIn();

  useEffect(() => {
    fetchChats().finally(() => setLoading(false));
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Чаты</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => onOpenChat(item)}
            activeOpacity={0.7}
          >
            <Avatar uri={item.peer?.avatar} username={item.peer?.username || 'Чат'} size={52} />
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {item.peer?.username || 'Чат'}
                </Text>
                <Text style={styles.chatTime}>{formatTime(item.updated_at)}</Text>
              </View>
              <Text style={styles.chatMessage} numberOfLines={1}>
                Нажми чтобы открыть
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет чатов</Text>
            <Text style={styles.emptyHint}>Найди людей во вкладке Знакомства</Text>
          </View>
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#000', letterSpacing: -1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 40 },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 16, marginBottom: 8, borderRadius: 16,
  },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#000', flex: 1 },
  chatTime: { fontSize: 12, color: '#999', marginLeft: 8 },
  chatMessage: { fontSize: 13, color: '#666' },
});
