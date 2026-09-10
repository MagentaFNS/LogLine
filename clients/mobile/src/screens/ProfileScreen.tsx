import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  Settings, LogOut, Bell, Shield, ChevronRight, Camera, Heart, Bookmark,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, getAvatarUrl } from '../config';
import { useStore } from '../store/useStore';
import { AnimatedPressable } from '../components/AnimatedPressable';

const MenuItem = ({ icon, label, onPress, danger, badge }: any) => (
  <AnimatedPressable onPress={onPress} style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, danger && { backgroundColor: '#FFEBE9' }]}>{icon}</View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
    </View>
    <View style={styles.menuRight}>
      {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
      <ChevronRight size={18} color={COLORS.gray400} strokeWidth={2} />
    </View>
  </AnimatedPressable>
);

export const ProfileScreen = () => {
  const { currentUser, logout, updateAvatar } = useStore();
  const navigation = useNavigation<any>();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Разрешение', 'Нужно разрешение на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
      exif: false,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      } as any);

      await updateAvatar(formData);
      Alert.alert('Готово', 'Аватар обновлён');
    } catch (e) {
      console.log(e);
      Alert.alert('Ошибка', 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Уверен, что хочешь выйти?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const firstLetter = currentUser?.username?.[0]?.toUpperCase() || '?';
  const avatarUrl = getAvatarUrl(currentUser?.avatar);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
        <TouchableOpacity>
          <Settings size={24} color={COLORS.black} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{firstLetter}</Text>
          )}

          <TouchableOpacity style={styles.cameraBtn} onPress={pickAndUpload} disabled={uploading}>
            <Camera size={16} color={COLORS.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{currentUser?.username}</Text>
        <Text style={styles.handle}>@{currentUser?.username?.toLowerCase()}</Text>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>
            {currentUser?.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { n: '32', l: 'Заметок' },
          { n: '128', l: 'Подписчиков' },
          { n: '86', l: 'Подписки' },
        ].map((s) => (
          <View key={s.l} style={styles.statBox}>
            <Text style={styles.statNumber}>{s.n}</Text>
            <Text style={styles.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menuCard}>
        <MenuItem icon={<Bell size={18} color={COLORS.black} strokeWidth={2} />} label="Уведомления" badge="3" onPress={() => navigation.navigate('Уведомления')} />
        <View style={styles.separator} />
        <MenuItem icon={<Heart size={18} color={COLORS.black} strokeWidth={2} />} label="Избранное" onPress={() => {}} />
        <View style={styles.separator} />
        <MenuItem icon={<Bookmark size={18} color={COLORS.black} strokeWidth={2} />} label="Сохранённое" onPress={() => {}} />
        <View style={styles.separator} />
        <MenuItem icon={<Shield size={18} color={COLORS.black} strokeWidth={2} />} label="Приватность" onPress={() => {}} />
      </View>

      <View style={styles.menuCard}>
        <MenuItem icon={<LogOut size={18} color={COLORS.danger} strokeWidth={2} />} label="Выйти из аккаунта" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>LogLine v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingTop: 64, paddingBottom: SPACING.lg,
  },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.black, letterSpacing: -1 },
  profileCard: {
    marginHorizontal: SPACING.lg, backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl, padding: SPACING.xxl, alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: COLORS.black, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.lg, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: COLORS.white, fontSize: 44, fontWeight: '800' },
  cameraBtn: {
    position: 'absolute', bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.black,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.white,
  },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  handle: { fontSize: 14, color: COLORS.gray400, marginTop: 4 },
  badgePill: {
    marginTop: SPACING.md, backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full,
  },
  badgePillText: { fontSize: 12, color: COLORS.gray600, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  statBox: { flex: 1, backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: COLORS.black },
  statLabel: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  menuCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  separator: { height: 1, backgroundColor: COLORS.gray100, marginLeft: 64 },
  badge: { backgroundColor: COLORS.danger, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  version: { textAlign: 'center', color: COLORS.gray400, fontSize: 12, marginTop: SPACING.xl },
});
