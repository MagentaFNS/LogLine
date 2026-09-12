import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert, Animated,
} from 'react-native';
import { ArrowLeft, Moon, Globe, Bell, Trash2, LogOut } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: Props) => {
  const { logout, addToast } = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const fadeAnim = useFadeIn();

  const handleLogout = () => {
    Alert.alert('Выход', 'Выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Очистить кэш?', 'Это удалит локальные данные', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Очистить',
        style: 'destructive',
        onPress: () => addToast('Кэш очищен', 'success'),
      },
    ]);
  };

  const Row = ({ icon, label, value, onValueChange, danger }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, danger && { backgroundColor: '#FFEBE9' }]}>
          {icon}
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#111' }]}>{label}</Text>
      </View>
      {onValueChange !== undefined ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E5EA', true: '#000' }}
          thumbColor="#fff"
        />
      ) : null}
    </View>
  );

  const Link = ({ icon, label, onPress, danger }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, danger && { backgroundColor: '#FFEBE9' }]}>
          {icon}
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#111' }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Настройки</Text>
      </View>

      {/* Внешний вид */}
      <Text style={styles.sectionTitle}>Внешний вид</Text>
      <View style={styles.card}>
        <Row
          icon={<Moon size={18} color="#111" />}
          label="Тёмная тема"
          value={darkMode}
          onValueChange={(v: boolean) => {
            setDarkMode(v);
            addToast(v ? 'Тёмная тема — скоро' : 'Светлая тема', 'info');
          }}
        />
        <View style={styles.separator} />
        <Row
          icon={<Globe size={18} color="#111" />}
          label="Язык интерфейса"
          value={false}
          onValueChange={() => addToast('Русский', 'info')}
        />
      </View>

      {/* Уведомления */}
      <Text style={styles.sectionTitle}>Уведомления</Text>
      <View style={styles.card}>
        <Row
          icon={<Bell size={18} color="#111" />}
          label="Push-уведомления"
          value={notifications}
          onValueChange={setNotifications}
        />
        <View style={styles.separator} />
        <Row
          icon={<Bell size={18} color="#111" />}
          label="Звук"
          value={sound}
          onValueChange={setSound}
        />
      </View>

      {/* Данные */}
      <Text style={styles.sectionTitle}>Данные</Text>
      <View style={styles.card}>
        <Link
          icon={<Trash2 size={18} color="#111" />}
          label="Очистить кэш"
          onPress={handleClearCache}
        />
      </View>

      {/* Аккаунт */}
      <Text style={styles.sectionTitle}>Аккаунт</Text>
      <View style={styles.card}>
        <Link
          icon={<LogOut size={18} color="#111" />}
          label="Выйти из аккаунта"
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.version}>LogLine v1.0.0</Text>
    </Animated.ScrollView>
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
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 20, marginTop: 16, marginBottom: 8,
  },
  card: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f2f2f7', justifyContent: 'center', alignItems: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  separator: { height: 1, backgroundColor: '#f2f2f7', marginLeft: 64 },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24 },
});
