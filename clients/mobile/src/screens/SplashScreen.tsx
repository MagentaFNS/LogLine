import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Logo } from '../components/Logo';
import { COLORS, SPACING } from '../config';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish?: () => void;
}

export const SplashScreen = ({ onFinish }: Props) => {
  // Анимации
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Появление логотипа с пружинкой (как в iOS)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Через 400мс — появление текста
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // 3. Пульсация логотипа (бесконечная, как в Telegram)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.06,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 800);

    // 4. Через 2.2 сек — плавное исчезновение экрана
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish?.());
    }, 2200);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Градиентный фон — мягкий переход как в iOS */}
      <LinearGradient
        colors={['#FFFFFF', '#F7F7F8', '#EFEFF1']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Лёгкие светящиеся круги для глубины */}
      <View style={styles.glowCircle1} />
      <View style={styles.glowCircle2} />

      {/* Центральная область с blur */}
      <BlurView intensity={30} tint="light" style={styles.glassCircle}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, pulseScale) },
              ],
            },
          ]}
        >
          <Logo size={100} />
        </Animated.View>
      </BlurView>

      {/* Текст "LogLine" с плавным появлением */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textSlide }],
          alignItems: 'center',
          marginTop: 40,
        }}
      >
        <Text style={styles.title}>LogLine</Text>
        <Text style={styles.subtitle}>Ваше цифровое пространство</Text>
      </Animated.View>

      {/* Внизу — индикатор загрузки (три точки) */}
      <Animated.View style={[styles.loaderRow, { opacity: textOpacity }]}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </Animated.View>

      {/* Копирайт внизу */}
      <Animated.Text style={[styles.footer, { opacity: textOpacity }]}>
        © 2026 LogLine
      </Animated.Text>
    </Animated.View>
  );
};

// Компонент пульсирующей точки
const Dot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  glowCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  glassCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  logoWrap: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 8,
    letterSpacing: 0.4,
  },
  loaderRow: {
    position: 'absolute',
    bottom: 140,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.black,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: COLORS.gray400,
    letterSpacing: 0.5,
  },
});
