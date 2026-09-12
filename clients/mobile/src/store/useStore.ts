import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { WSClient } from '../ws';
import { User, Chat, Message } from '../types';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface State {
  token: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;

  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  users: User[];
  typingUsers: Set<number>;
  ws: WSClient | null;
  selectedChatId: number | null;
  selectedChat: Chat | null;
  setSelectedChat: (id: number | null) => void;
  switchTab: ((tab: string) => void) | null;
  setSwitchTab: (fn: (tab: string) => void) => void;
  chatNotifications: Record<number, number>;
  unreadChats: number;

  toasts: Array<{ id: string; text: string; type: 'info' | 'success' | 'error' }>;
  addToast: (text: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<void>;
  updateProfile: (username: string, bio: string, category: string) => Promise<void>;

  fetchChats: () => Promise<void>;
  openChat: (chat: Chat) => Promise<void>;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  createPrivateChat: (userId: number) => Promise<Chat | null>;
  searchUsers: (q: string) => Promise<User[]>;
  fetchUsers: (reset?: boolean, category?: string) => Promise<void>;
  clearChatNotification: (chatId: number) => void;

  initWS: () => void;
  disconnectWS: () => void;
}

export const useStore = create<State>((set, get) => ({
  token: null,
  currentUser: null,
  isAdmin: false,
  isLoading: true,

  chats: [],
  currentChat: null,
  messages: [],
  users: [],
  typingUsers: new Set(),
  ws: null,
  selectedChatId: null,
  selectedChat: null,
  switchTab: null,

  chatNotifications: {},
  unreadChats: 0,
  toasts: [],

  addToast: (text, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  login: async (username, password) => {
    const res = await api.post('/login', { username, password });
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, currentUser: user, isAdmin: user.role === 'admin', isLoading: false });
    get().fetchChats();
    get().initWS();
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
      get().fetchChats();
      get().initWS();
    } catch {
      await AsyncStorage.removeItem('token');
      set({ token: null, currentUser: null, isAdmin: false, isLoading: false });
    }
  },

  logout: async () => {
    get().disconnectWS();
    await AsyncStorage.removeItem('token');
    set({ token: null, currentUser: null, isAdmin: false, chats: [], messages: [], currentChat: null });
  },

  updateAvatar: async (formData) => {
    const res = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, avatar: res.data.avatar } : null,
    }));
  },

  updateProfile: async (username, bio, category) => {
    const res = await api.post('/update-profile', { username, bio, category });
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, username: res.data.username, bio: res.data.bio, category: res.data.category }
        : null,
    }));
  },

  fetchChats: async () => {
    try {
      const res = await api.get('/chats');
      const chats = res.data;
      const { selectedChatId } = get();
      const selectedChat = selectedChatId
        ? chats.find((c: Chat) => c.id === selectedChatId) || null
        : null;
      set({ chats, selectedChat });
    } catch (e) {
      console.error('❌ [fetchChats]', e);
    }
  },

  openChat: async (chat) => {
    set({ currentChat: chat, messages: [], typingUsers: new Set() });
    get().clearChatNotification(chat.id);
    try {
      const res = await api.get(`/chats/${chat.id}/messages`);
      set({ messages: res.data });
      const ws = get().ws;
      if (ws) ws.send('message:read', { chat_id: chat.id });
    } catch (e) {
      console.error('❌ [openChat]', e);
    }
  },

  closeChat: () => {
    set({ currentChat: null, messages: [], typingUsers: new Set() });
  },

  sendMessage: (content) => {
    const { ws, currentChat } = get();
    if (!ws || !currentChat || !content.trim()) return;
    const clientMsgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    ws.send('message:send', {
      chat_id: currentChat.id,
      content: content.trim(),
      client_msg_id: clientMsgId,
    });
  },

  createPrivateChat: async (userId) => {
    try {
      const res = await api.post('/chats', { user_id: userId });
      await get().fetchChats();
      return res.data;
    } catch (e) {
      console.error('❌ [createPrivateChat]', e);
      return null;
    }
  },

  searchUsers: async (q) => {
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      return res.data;
    } catch {
      return [];
    }
  },

  fetchUsers: async (reset = false, category = '') => {
    try {
      const offset = reset ? 0 : get().users.length;
      const catQuery = category && category !== 'all' ? `&category=${category}` : '';
      const res = await api.get(`/users?limit=20&offset=${offset}${catQuery}`);
      set((state) => ({
        users: reset ? res.data.users : [...state.users, ...res.data.users],
      }));
    } catch (e) {
      console.error('❌ [fetchUsers]', e);
    }
  },

  setSelectedChat: (id) => {
    const { chats } = get();
    const chat = id ? chats.find((c) => c.id === id) || null : null;
    set({ selectedChatId: id, selectedChat: chat });
  },

  setSwitchTab: (fn) => {
    set({ switchTab: fn });
  },

  clearChatNotification: (chatId) => {
    set((state) => {
      const newN = { ...state.chatNotifications };
      delete newN[chatId];
      const total = Object.values(newN).reduce((a, b) => a + b, 0);
      return { chatNotifications: newN, unreadChats: total };
    });
  },

  initWS: () => {
    const { token } = get();
    if (!token || get().ws) return;

    const ws = new WSClient(token);

    ws.on('message:new', (msg: Message) => {
      const { currentChat, currentUser } = get();
      if (currentChat && msg.chat_id === currentChat.id) {
        set((state) => ({ messages: [...state.messages, msg] }));
      } else if (msg.user_id !== currentUser?.id) {
        get().addToast(`💬 ${msg.username}: новое сообщение`, 'info');
        set((state) => {
          const newN = { ...state.chatNotifications };
          newN[msg.chat_id] = (newN[msg.chat_id] || 0) + 1;
          const total = Object.values(newN).reduce((a, b) => a + b, 0);
          return { chatNotifications: newN, unreadChats: total };
        });
      }
      get().fetchChats();
    });

    ws.on('typing:start', (data: any) => {
      const { currentChat } = get();
      if (currentChat && data.chat_id === currentChat.id) {
        set((state) => {
          const s = new Set(state.typingUsers);
          s.add(data.user_id);
          return { typingUsers: s };
        });
      }
    });

    ws.on('typing:stop', (data: any) => {
      set((state) => {
        const s = new Set(state.typingUsers);
        s.delete(data.user_id);
        return { typingUsers: s };
      });
    });

    ws.on('presence:online', () => get().fetchChats());
    ws.on('presence:offline', () => get().fetchChats());

    ws.connect();
    set({ ws });
  },

  disconnectWS: () => {
    const { ws } = get();
    if (ws) ws.disconnect();
    set({ ws: null });
  },
}));
