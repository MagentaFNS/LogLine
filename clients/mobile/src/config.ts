export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.102:8080/api';

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.0.102:8080';

export const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

export const getAvatarUrl = (raw?: string): string | undefined => {
  if (!raw || raw.trim() === '') return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${BACKEND_URL}/uploads/${raw}`;
};

export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F5F5F7',
  gray50: '#F9F9FB',
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#AEAEB2',
  gray500: '#8E8E93',
  gray600: '#636366',
  gray700: '#48484A',
  gray800: '#2C2C2E',
  gray900: '#1C1C1E',
  accent: '#0A84FF',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  glassLight: 'rgba(255, 255, 255, 0.72)',
  glassDark: 'rgba(28, 28, 30, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.12)',
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 999 };

if (__DEV__) {
  console.log('🌐 API_URL:', API_URL);
  console.log('🔗 BACKEND_URL:', BACKEND_URL);
}
