import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { api } from '../api';
import { COLORS, RADIUS, SPACING } from '../config';
import { useFadeIn } from '../hooks/useFadeIn';

interface Notification {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useFadeIn();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.log('❌ notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'сейчас';
    if (mins < 60) return `${mins} мин`;
    if (mins < 1440) return `${Math.floor(mins / 60)} ч`;
    return `${Math.floor(mins / 1440)} дн`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Уведомления</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View style={styles.notifCard}>
              <View style={styles.iconWrap}>
                <Bell size={20} color="#000" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifText}>{item.text}</Text>
              </View>
              <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Bell size={48} color={COLORS.gray300} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Пока тихо</Text>
              <Text style={styles.emptyText}>Здесь появятся уведомления</Text>
            </View>
          }
        />
      )}
    </Animated.View>
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
    backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center',
  },
  notifText: { fontSize: 14, color: COLORS.gray800 },
  notifTime: { fontSize: 12, color: COLORS.gray400 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray800, marginTop: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.gray500, marginTop: 4 },
});
