import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Heart, Trash2 } from 'lucide-react-native';
import { Avatar } from './Avatar';

interface Props {
  item: any;
  isLiked: boolean;
  isMine: boolean;
  onLike: () => void;
  onDelete: () => void;
}

export const AnimatedPost = ({ item, isLiked, isMine, onLike, onDelete }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <Avatar uri={item.avatar} username={item.username} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={styles.user}>{item.username}</Text>
          <Text style={styles.time}>сейчас</Text>
        </View>
        {isMine && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{item.content}</Text>

      <TouchableOpacity onPress={onLike} style={styles.likeBtn}>
        <Heart
          size={18}
          color={isLiked ? '#FF3B30' : '#666'}
          fill={isLiked ? '#FF3B30' : 'transparent'}
        />
        <Text style={[styles.likeText, isLiked && { color: '#FF3B30' }]}>
          {item.likes || 0}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, marginHorizontal: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  user: { fontWeight: '700', fontSize: 15, color: '#000' },
  time: { fontSize: 12, color: '#999', marginTop: 2 },
  deleteBtn: {
    padding: 8, backgroundColor: '#000', borderRadius: 8,
  },
  content: { fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 22 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeText: { fontSize: 13, color: '#666', fontWeight: '600' },
});
