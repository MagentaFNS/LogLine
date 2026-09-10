import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { COLORS, RADIUS, SPACING } from '../config';

const { width } = Dimensions.get('window');

export const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Ошибка', 'Заполни все поля');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(username, password);
      else await login(username, password);
    } catch (e: any) {
      Alert.alert('Ошибка', e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Красивый градиентный фон */}
      <LinearGradient
        colors={['#FFFFFF', '#F5F5F7', '#E8E8ED']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Декоративные круги */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Логотип */}
          <View style={styles.logoWrap}>
            <Logo size={88} />
          </View>

          <Text style={styles.brand}>LogLine</Text>
          <Text style={styles.tagline}>Цифровое пространство для тебя</Text>

          {/* Форма */}
          <View style={styles.form}>
            <Text style={styles.label}>ИМЯ ПОЛЬЗОВАТЕЛЯ</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите имя"
              placeholderTextColor={COLORS.gray400}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: SPACING.lg }]}>ПАРОЛЬ</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* БОЛЬШАЯ ГРАДИЕНТНАЯ КНОПКА */}
          <AnimatedPressable onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={['#000000', '#1C1C1E', '#2C2C2E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegister ? 'Создать аккаунт' : 'Войти'}
                </Text>
              )}
            </LinearGradient>
          </AnimatedPressable>

          {/* Переключатель */}
          <AnimatedPressable onPress={() => setIsRegister(!isRegister)} disabled={loading}>
            <Text style={styles.switchText}>
              {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
              <Text style={styles.switchLink}>{isRegister ? 'Войти' : 'Зарегистрироваться'}</Text>
            </Text>
          </AnimatedPressable>

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  glow1: {
    position: 'absolute', top: -100, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  glow2: {
    position: 'absolute', bottom: -150, left: -150,
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  keyboard: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: SPACING.xxl, alignItems: 'center' },
  logoWrap: { marginBottom: SPACING.xl },
  brand: {
    fontSize: 38, fontWeight: '800', color: COLORS.black,
    letterSpacing: -1.5, marginBottom: 8,
  },
  tagline: {
    fontSize: 14, color: COLORS.gray500,
    marginBottom: 48, letterSpacing: 0.3,
  },
  form: { width: '100%', marginBottom: SPACING.xxl },
  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.gray500,
    marginBottom: SPACING.sm, marginLeft: 4, letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 18,
    fontSize: 16,
    color: COLORS.black,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  // ⬇️ БОЛЬШАЯ КРАСИВАЯ КНОПКА
  button: {
    width: width - SPACING.xxl * 2,
    paddingVertical: 20,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white, fontSize: 17, fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchText: { color: COLORS.gray500, fontSize: 14 },
  switchLink: { color: COLORS.black, fontWeight: '700' },
});
