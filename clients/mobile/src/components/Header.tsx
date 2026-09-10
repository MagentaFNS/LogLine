import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { LogoText } from './LogoText';
import { COLORS, SPACING } from '../config';

interface Props {
  onBellPress?: () => void;
  showBell?: boolean;
}

export const Header = ({ onBellPress, showBell = true }: Props) => {
  const { currentUser } = useStore();

  return (
    <View style={styles.header}>
      <LogoText size={32} />

      <View style={styles.rightSide}>
        {showBell && (
          <TouchableOpacity style={styles.bellBtn} onPress={onBellPress}>
            <Bell size={22} color={COLORS.black} strokeWidth={2} />
            <View style={styles.badge} />
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 64,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.offWhite,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  badge: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 2, borderColor: COLORS.white,
  },
});
