import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  avatar: string;
  bio: string;
}

interface State {
  token: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  token: null,
  currentUser: null,
  isAdmin: false,
  isLoading: true,

  login: async (username, password) => {
    const res = await api.post('/login', { username, password });
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, currentUser: user, isAdmin: user.role === 'admin', isLoading: false });
  },

  register: async (username, password) => {
    await api.post('/register', { username, password });
    await get().login(username, password);
  },

  fetchCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await api.get('/me');
      set({ token, currentUser: res.data, isAdmin: res.data.role === 'admin', isLoading: false });
    } catch {
      await AsyncStorage.removeItem('token');
      set({ token: null, currentUser: null, isAdmin: false, isLoading: false });
    }
  },

  updateAvatar: async (formData) => {
    const res = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Обновляем аватар в сторе СРАЗУ, чтобы UI обновился
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, avatar: res.data.avatar }
        : null,
    }));
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, currentUser: null, isAdmin: false });
  },
}));
