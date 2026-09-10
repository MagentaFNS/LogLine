import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../config';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'like', title: 'Мария Иванова', text: 'оценила твой пост', time: '5 мин', icon: Heart, color: '#FF3B30' },
  { id: 2, type: 'comment', title: 'Дмитрий Смирнов', text: 'прокомментировал заметку', time: '15 мин', icon: MessageCircle, color: '#0A84FF' },
  { id: 3, type: 'follow', title: 'Ольга Петрова', text: 'подписалась на тебя', time: '1 ч', icon: UserPlus, color: '#34C759' },
  { id: 4, type: 'system', title: 'LogLine', text: 'Добро пожаловать в приложение!', time: '2 ч', icon: Bell, color: '#000000' },
];

export const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Уведомления</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={styles.notifCard}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                <Icon size={20} color={item.color} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifText}>{item.text}</Text>
              </View>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Bell size={48} color={COLORS.gray300} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Пока тихо</Text>
            <Text style={styles.emptyText}>Здесь появятся уведомления</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { paddingHorizontal: SPACING.xl, paddingTop: 64, paddingBottom: SPACING.lg },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.black, letterSpacing: -1 },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    padding: SPACING.lg, borderRadius: RADIUS.lg,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  notifTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  notifText: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  notifTime: { fontSize: 12, color: COLORS.gray400 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray800, marginTop: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.gray500, marginTop: 4 },
});
