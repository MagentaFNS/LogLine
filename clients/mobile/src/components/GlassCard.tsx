import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS } from '../config';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 60 }: Props) => {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassLight,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
