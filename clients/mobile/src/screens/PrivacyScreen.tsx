import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Animated,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, MessageCircle, UserCheck } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  onBack: () => void;
}

export const PrivacyScreen = ({ onBack }: Props) => {
  const { addToast } = useStore();
  const [showOnline, setShowOnline] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);
  const fadeAnim = useFadeIn();

  const Row = ({ icon, label, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#000' }}
        thumbColor="#fff"
      />
    </View>
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
        <Text style={styles.title}>Приватность</Text>
      </View>

      <Text style={styles.sectionTitle}>Видимость</Text>
      <View style={styles.card}>
        <Row
          icon={showOnline ? <Eye size={18} color="#111" /> : <EyeOff size={18} color="#111" />}
          label="Показывать онлайн-статус"
          value={showOnline}
          onValueChange={(v: boolean) => {
            setShowOnline(v);
            addToast(v ? 'Статус виден' : 'Статус скрыт', 'success');
          }}
        />
        <View style={styles.separator} />
        <Row
          icon={<Eye size={18} color="#111" />}
          label="Показывать «был(а) недавно»"
          value={showLastSeen}
          onValueChange={setShowLastSeen}
        />
        <View style={styles.separator} />
        <Row
          icon={<UserCheck size={18} color="#111" />}
          label="Отображать в поиске"
          value={showInSearch}
          onValueChange={setShowInSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Сообщения</Text>
      <View style={styles.card}>
        <Row
          icon={<MessageCircle size={18} color="#111" />}
          label="Принимать сообщения от всех"
          value={allowMessages}
          onValueChange={setAllowMessages}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 Мы не передаём твои данные третьим лицам.
        </Text>
      </View>
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
  infoBox: {
    marginHorizontal: 16, marginTop: 24, padding: 16,
    backgroundColor: '#F2F2F7', borderRadius: 12,
  },
  infoText: { fontSize: 13, color: '#666', textAlign: 'center' },
});
