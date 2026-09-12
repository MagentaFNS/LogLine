import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { CATEGORIES } from '../constants';
import { useFadeIn } from '../hooks/useFadeIn';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const MatchesScreen = ({ onOpenUser }: { onOpenUser: (user: any) => void }) => {
  const { users, fetchUsers, createPrivateChat, setSelectedChat, addToast, chats } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const fadeAnim = useFadeIn();
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchUsers(true, activeFilter);
  }, [activeFilter]);

  const handleWrite = async (user: any) => {
    console.log('✉️ [Matches] пишу:', user.username);
    try {
      const chat = await createPrivateChat(user.id);
      console.log('✉️ [Matches] чат:', chat);

      if (chat) {
        // Устанавливаем selectedChat в стор
        setSelectedChat(chat.id);
        // Переключаемся на вкладку Чаты
        navigation.navigate('Чаты');
        addToast(`Чат с ${user.username}`, 'success');
      }
    } catch (e) {
      console.error('❌ [Matches] handleWrite:', e);
      Alert.alert('Ошибка', 'Не удалось открыть чат');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Знакомства</Text>
        <Text style={styles.subtitle}>Найди разработчиков</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersContainer}
      >
        {[{ id: 'all', label: 'Все' }, ...CATEGORIES].map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setActiveFilter(f.id)}
            style={[styles.filter, activeFilter === f.id && styles.filterActive]}
          >
            <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_WIDTH }]}>
            <TouchableOpacity onPress={() => onOpenUser(item)} style={styles.cardInner}>
              <Avatar uri={item.avatar} username={item.username} size={80} />
              <Text style={styles.cardName} numberOfLines={1}>{item.username}</Text>
              <Text style={styles.cardBio} numberOfLines={2}>
                {item.bio || 'Разработчик'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.writeBtn} onPress={() => handleWrite(item)}>
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.writeBtnText}>Написать</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока никого нет</Text>
          </View>
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#000', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  filtersContainer: { flexGrow: 0, maxHeight: 60 },
  filters: { paddingHorizontal: 16, gap: 8, paddingVertical: 12, alignItems: 'center' },
  filter: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', marginRight: 8,
  },
  filterActive: { backgroundColor: '#000' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 140 },
  columnWrapper: { justifyContent: 'flex-start', gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  cardInner: { alignItems: 'center', marginBottom: 12 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#000', marginTop: 10 },
  cardBio: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  writeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#000', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, width: '100%',
  },
  writeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#666' },
});
