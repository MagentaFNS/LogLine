import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { COLORS } from '../config';

interface Props {
  size?: number;
}

export const LogoText = ({ size = 34 }: Props) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Перелив: сдвигаем градиент вправо
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      <MaskedView
        maskElement={
          <Text style={[styles.text, { fontSize: size, fontWeight: '800' }]}>
            LogLine
          </Text>
        }
      >
        {/* Базовый чёрный текст */}
        <Text style={[styles.text, { fontSize: size, color: COLORS.black }]}>
          LogLine
        </Text>

        {/* Переливающийся градиент поверх */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX }] },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255,255,255,0.85)',
              'transparent',
            ]}
            locations={[0.3, 0.5, 0.7]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start' },
  text: {
    letterSpacing: -1.5,
    fontWeight: '800',
  },
});
