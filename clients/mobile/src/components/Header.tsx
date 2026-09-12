import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { LogoText } from './LogoText';

export const Header = () => {
  const { currentUser, unreadChats } = useStore();
  const navigation = useNavigation<any>();

  const handleBellPress = () => {
    navigation.navigate('Уведомления');
  };

  return (
    <View style={styles.header}>
      <LogoText size={32} />

      <View style={styles.rightSide}>
        <TouchableOpacity style={styles.bellBtn} onPress={handleBellPress}>
          <Bell size={22} color="#000" strokeWidth={2} />
          {(unreadChats > 0) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadChats > 9 ? '9+' : unreadChats}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Avatar
          uri={currentUser?.avatar}
          username={currentUser?.username}
          size={44}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 16,
    backgroundColor: '#f5f5f7',
  },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 18, height: 18, paddingHorizontal: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
