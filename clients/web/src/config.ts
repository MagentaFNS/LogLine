// clients/web/src/config.ts
// ✅ Никакого хардкода — читаем из .env (Vite-стиль: VITE_*)

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://192.168.0.102:8080/api';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://192.168.0.102:8080';

// BACKEND_URL вычисляется из API_URL
export const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// Универсальный сборщик URL для аватарок
export const getAvatarUrl = (raw?: string): string | undefined => {
  if (!raw || raw.trim() === '') return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${BACKEND_URL}/uploads/${raw}`;
};

if (import.meta.env.DEV) {
  console.log('🌐 API_URL:', API_URL);
  console.log('🔗 BACKEND_URL:', BACKEND_URL);
}
