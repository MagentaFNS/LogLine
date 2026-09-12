import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  item: any;
  isMine: boolean;
  formatTime: (iso: string) => string;
}

export const AnimatedMessage = ({ item, isMine, formatTime }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isMine && styles.messageRowMine,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.messageText, isMine && { color: '#fff' }]}>
          {item.content}
        </Text>
        <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.6)' }]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageRow: { marginBottom: 8, alignItems: 'flex-start' },
  messageRowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: { backgroundColor: '#000', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: '#000', lineHeight: 20 },
  time: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
});
