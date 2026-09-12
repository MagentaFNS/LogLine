import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Settings, LogOut, Bell, Shield, ChevronRight,
  Heart, Bookmark, Camera, Users, FileText, MessageSquare,
} from 'lucide-react-native';
import { api } from '../api';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { CATEGORIES } from '../constants';
import { useFadeIn } from '../hooks/useFadeIn';
import { SettingsScreen } from './SettingsScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { PrivacyScreen } from './PrivacyScreen';

interface Stats {
  notes: number;
  posts: number;
  chats: number;
  messages: number;
}

export const ProfileScreen = () => {
  const { currentUser, updateAvatar, logout, unreadChats, addToast } = useStore();
  const [stats, setStats] = useState<Stats>({ notes: 0, posts: 0, chats: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [screen, setScreen] = useState<'main' | 'settings' | 'favorites' | 'saved' | 'privacy'>('main');
  const fadeAnim = useFadeIn();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/profile/stats');
      console.log('📊 [stats]:', res.data);
      setStats(res.data);
    } catch (e) {
      console.log('❌ stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Разрешение', 'Нужно разрешение на галерею');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      await updateAvatar(formData);
      addToast('Аватар обновлён', 'success');
    } catch (e) {
      addToast('Ошибка загрузки', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenScreen = (s: 'settings' | 'favorites' | 'saved' | 'privacy') => {
    setScreen(s);
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const categoryLabel = CATEGORIES.find((c) => c.id === currentUser?.category)?.label;

  const MenuItem = ({ icon, label, onPress, badge }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
        <ChevronRight size={18} color="#999" />
      </View>
    </TouchableOpacity>
  );

  // Навигация
  if (screen === 'settings') return <SettingsScreen onBack={() => setScreen('main')} />;
  if (screen === 'favorites') return <FavoritesScreen mode="favorites" onBack={() => setScreen('main')} />;
  if (screen === 'saved') return <FavoritesScreen mode="saved" onBack={() => setScreen('main')} />;
  if (screen === 'privacy') return <PrivacyScreen onBack={() => setScreen('main')} />;

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
        <TouchableOpacity onPress={() => handleOpenScreen('settings')}>
          <Settings size={24} color="#000" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Avatar
              uri={currentUser?.avatar}
              username={currentUser?.username}
              size={120}
            />
          </View>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={pickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Camera size={16} color="#fff" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{currentUser?.username}</Text>
        <Text style={styles.handle}>@{currentUser?.username?.toLowerCase()}</Text>
        {categoryLabel && (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} color="#000" />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <FileText size={18} color="#666" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{stats.notes}</Text>
            <Text style={styles.statLabel}>Заметок</Text>
          </View>
          <View style={styles.statBox}>
            <Users size={18} color="#666" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{stats.chats}</Text>
            <Text style={styles.statLabel}>Друзей</Text>
          </View>
          <View style={styles.statBox}>
            <MessageSquare size={18} color="#666" style={{ marginBottom: 4 }} />
            <Text style={styles.statNumber}>{stats.messages}</Text>
            <Text style={styles.statLabel}>Сообщений</Text>
          </View>
        </View>
      )}

      {/* Menu */}
      <View style={styles.menuCard}>
        <MenuItem
          icon={<Bell size={18} color="#111" strokeWidth={2} />}
          label="Уведомления"
          badge={unreadChats}
          onPress={() => addToast('Уведомления — на вкладке снизу', 'info')}
        />
        <View style={styles.separator} />
        <MenuItem
          icon={<Heart size={18} color="#111" strokeWidth={2} />}
          label="Избранное"
          onPress={() => handleOpenScreen('favorites')}
        />
        <View style={styles.separator} />
        <MenuItem
          icon={<Bookmark size={18} color="#111" strokeWidth={2} />}
          label="Сохранённое"
          onPress={() => handleOpenScreen('saved')}
        />
        <View style={styles.separator} />
        <MenuItem
          icon={<Shield size={18} color="#111" strokeWidth={2} />}
          label="Приватность"
          onPress={() => handleOpenScreen('privacy')}
        />
        <View style={styles.separator} />
        <MenuItem
          icon={<Settings size={18} color="#111" strokeWidth={2} />}
          label="Настройки"
          onPress={() => handleOpenScreen('settings')}
        />
      </View>

      {/* Logout */}
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIcon}>
              <LogOut size={18} color="#111" strokeWidth={2} />
            </View>
            <Text style={styles.menuLabel}>Выйти из аккаунта</Text>
          </View>
          <ChevronRight size={18} color="#999" />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>LogLine v1.0.0</Text>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#000', letterSpacing: -1 },
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    paddingVertical: 32, paddingHorizontal: 24,
    alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
  },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarCircle: {
    width: 120, height: 120, borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4, borderColor: '#fff',
    backgroundColor: '#000',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  name: { fontSize: 24, fontWeight: '800', color: '#000', letterSpacing: -0.5 },
  handle: { fontSize: 14, color: '#999', marginTop: 4 },
  categoryPill: {
    marginTop: 12, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: '#f2f2f7', borderRadius: 999,
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#666' },
  statsRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: '#fff', padding: 16,
    borderRadius: 16, alignItems: 'center',
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#000' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  menuCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  separator: { height: 1, backgroundColor: '#f2f2f7', marginLeft: 64 },
  badge: {
    backgroundColor: '#FF3B30', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, minWidth: 20, alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24, marginBottom: 20 },
});
