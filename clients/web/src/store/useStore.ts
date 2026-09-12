import { create } from 'zustand';
import { api } from '../api';
import { WSClient } from '../ws';
import { User, Note, Post, Notification, Work, Chat, Message } from '../types';

interface State {
  // Auth
  token: string | null;
  currentUser: User | null;
  isAdmin: boolean;

  // Data
  notes: Note[];
  posts: Post[];
  notifications: Notification[];
  works: Work[];

  // Chat
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  ws: WSClient | null;
  typingUsers: Set<number>;

  // Notifications (unread per chat)
  chatNotifications: Record<number, number>;
  unreadChats: number;
  clearChatNotification: (chatId: number) => void;

  // Toasts
  toasts: Array<{ id: string; text: string; type: 'info' | 'success' | 'error' }>;
  addToast: (text: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;

  // Users (для Знакомств)
  users: User[];
  usersTotal: number;
  usersOffset: number;
  fetchUsers: (reset?: boolean, category?: string) => Promise<void>;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (file: File) => Promise<void>;
  updateProfile: (username: string, bio: string, category: string) => Promise<void>;

  fetchNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;

  fetchPosts: () => Promise<void>;
  createPost: (content: string, image?: string, code?: string) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  unlikePost: (id: number) => Promise<void>;

  fetchWorks: () => Promise<void>;
  createWork: (title: string, company: string, location: string, salary: string) => Promise<void>;

  fetchNotifications: () => Promise<void>;

  fetchChats: () => Promise<void>;
  openChat: (chat: Chat) => Promise<void>;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  createPrivateChat: (userId: number) => Promise<Chat | null>;
  searchUsers: (q: string) => Promise<User[]>;
  initWS: () => void;
  disconnectWS: () => void;
}

export const useStore = create<State>((set, get) => ({
  // === INITIAL STATE ===
  token: localStorage.getItem('token'),
  currentUser: null,
  isAdmin: false,

  notes: [],
  posts: [],
  notifications: [],
  works: [],

  chats: [],
  currentChat: null,
  messages: [],
  ws: null,
  typingUsers: new Set(),

  chatNotifications: {},
  unreadChats: 0,

  users: [],
  usersTotal: 0,
  usersOffset: 0,

  toasts: [],

  // === AUTH ===
  login: async (username, password) => {
    console.log('🔐 [login] попытка:', username);
    const res = await api.post('/login', { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    set({ token, currentUser: user, isAdmin: user.role === 'admin' });
    console.log('✅ [login] успешно:', user.username, 'id:', user.id);

    get().fetchPosts();
    get().fetchWorks();
    get().fetchNotifications();
    get().fetchChats();
    get().initWS();
  },

  register: async (username, password) => {
    await api.post('/register', { username, password });
    await get().login(username, password);
  },

  logout: () => {
    get().disconnectWS();
    localStorage.removeItem('token');
    set({
      token: null,
      currentUser: null,
      isAdmin: false,
      chats: [],
      messages: [],
      currentChat: null,
      chatNotifications: {},
      unreadChats: 0,
    });
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, avatar: res.data.avatar }
        : null,
    }));
  },

  updateProfile: async (username, bio, category) => {
    const res = await api.post('/update-profile', { username, bio, category });
    set((state) => ({
      currentUser: state.currentUser
        ? {
            ...state.currentUser,
            username: res.data.username,
            bio: res.data.bio,
            category: res.data.category,
          }
        : null,
    }));
  },

  // === NOTES ===
  fetchNotes: async () => {
    const res = await api.get('/notes');
    set({ notes: res.data });
  },

  createNote: async (title, content) => {
    await api.post('/notes', { title, content });
    await get().fetchNotes();
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    await get().fetchNotes();
  },

  // === POSTS ===
  fetchPosts: async () => {
    const res = await api.get('/posts');
    set({ posts: res.data });
  },

  createPost: async (content, image, code) => {
    await api.post('/posts', { content, image, code });
    await get().fetchPosts();
  },

  likePost: async (id) => {
    await api.post(`/posts/${id}/like`);
    await get().fetchPosts();
  },

  unlikePost: async (id) => {
    await api.post(`/posts/${id}/unlike`);
    await get().fetchPosts();
  },

  // === WORKS ===
  fetchWorks: async () => {
    const res = await api.get('/works');
    set({ works: res.data });
  },

  createWork: async (title, company, location, salary) => {
    await api.post('/works', { title, company, location, salary });
    await get().fetchWorks();
  },

  // === NOTIFICATIONS ===
  fetchNotifications: async () => {
    const res = await api.get('/notifications');
    set({ notifications: res.data });
  },

  // === CHAT NOTIFICATIONS ===
  clearChatNotification: (chatId) => {
    set((state) => {
      const newNotifications = { ...state.chatNotifications };
      delete newNotifications[chatId];
      const total = Object.values(newNotifications).reduce((a, b) => a + b, 0);
      return { chatNotifications: newNotifications, unreadChats: total };
    });
  },

  addToast: (text, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // === USERS (Знакомства) ===
  fetchUsers: async (reset = false, category = '') => {
    const { usersOffset } = get();
    const offset = reset ? 0 : usersOffset;
    const limit = 20;
    const catQuery = category && category !== 'all' ? `&category=${category}` : '';

    try {
      const res = await api.get(`/users?limit=${limit}&offset=${offset}${catQuery}`);
      const newUsers = res.data.users;
      const total = res.data.total;

      set((state) => ({
        users: reset ? newUsers : [...state.users, ...newUsers],
        usersTotal: total,
        usersOffset: offset + newUsers.length,
      }));
    } catch (e) {
      console.error('❌ [fetchUsers] error:', e);
    }
  },

  // === CHAT ===
  fetchChats: async () => {
    console.log('📋 [fetchChats] запрос');
    try {
      const res = await api.get('/chats');
      console.log('📋 [fetchChats] получено:', res.data.length, 'чатов');
      set({ chats: res.data });
    } catch (e) {
      console.error('❌ [fetchChats] error:', e);
    }
  },

  openChat: async (chat) => {
    console.log('📂 [openChat] открываю:', chat.id, chat.peer?.username);
    set({ currentChat: chat, messages: [], typingUsers: new Set() });

    // Очищаем уведомления для этого чата
    get().clearChatNotification(chat.id);

    try {
      const res = await api.get(`/chats/${chat.id}/messages`);
      console.log('📂 [openChat] загружено сообщений:', res.data.length);
      set({ messages: res.data });

      const ws = get().ws;
      if (ws) {
        ws.send('message:read', { chat_id: chat.id });
      }
    } catch (e) {
      console.error('❌ [openChat] error:', e);
    }
  },

  closeChat: () => {
    set({ currentChat: null, messages: [], typingUsers: new Set() });
  },

  sendMessage: (content) => {
    console.log('🔵 [sendMessage] вызван, content:', JSON.stringify(content));
    const { ws, currentChat } = get();

    if (!ws) {
      console.error('❌ [sendMessage] нет ws');
      return;
    }
    if (!currentChat) {
      console.error('❌ [sendMessage] нет currentChat');
      return;
    }
    if (!content.trim()) {
      console.error('❌ [sendMessage] пустой content');
      return;
    }

    const clientMsgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    console.log('🔵 [sendMessage] отправляю chat_id:', currentChat.id);

    ws.send('message:send', {
      chat_id: currentChat.id,
      content: content.trim(),
      client_msg_id: clientMsgId,
    });

    console.log('✅ [sendMessage] отправлено');
  },

  createPrivateChat: async (userId) => {
    try {
      const res = await api.post('/chats', { user_id: userId });
      await get().fetchChats();
      return res.data;
    } catch (e) {
      console.error('❌ [createPrivateChat] error:', e);
      return null;
    }
  },

  searchUsers: async (q) => {
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      return res.data;
    } catch (e) {
      console.error('❌ [searchUsers] error:', e);
      return [];
    }
  },

  initWS: () => {
    console.log('🚀 [initWS] старт');
    const { token } = get();
    if (!token) {
      console.error('❌ [initWS] нет токена');
      return;
    }

    if (get().ws) {
      console.log('⚠️ [initWS] WS уже создан, пропускаю');
      return;
    }

    const ws = new WSClient(token);

    ws.on('message:new', (msg: Message) => {
      console.log('📥 [message:new] пришло:', msg);
      const { currentChat, currentUser } = get();

      if (currentChat && msg.chat_id === currentChat.id) {
        console.log('📥 [message:new] ✅ добавляю в UI');
        set((state) => ({ messages: [...state.messages, msg] }));
      } else {
        if (msg.user_id !== currentUser?.id) {
          console.log('🔔 [message:new] увеличиваю счётчик для чата', msg.chat_id);
          set((state) => {
            const newNotifications = { ...state.chatNotifications };
            newNotifications[msg.chat_id] = (newNotifications[msg.chat_id] || 0) + 1;
            const total = Object.values(newNotifications).reduce((a, b) => a + b, 0);
            return { chatNotifications: newNotifications, unreadChats: total };
          });
        }
      }

      get().fetchChats();
    });

    ws.on('message:read', (data: any) => {
      console.log('📥 [message:read]:', data);
    });

    ws.on('typing:start', (data: any) => {
      console.log('📥 [typing:start]:', data);
      const { currentChat } = get();
      if (currentChat && data.chat_id === currentChat.id) {
        set((state) => {
          const newSet = new Set(state.typingUsers);
          newSet.add(data.user_id);
          return { typingUsers: newSet };
        });
      }
    });

    ws.on('typing:stop', (data: any) => {
      console.log('📥 [typing:stop]:', data);
      set((state) => {
        const newSet = new Set(state.typingUsers);
        newSet.delete(data.user_id);
        return { typingUsers: newSet };
      });
    });

    ws.on('presence:online', (data: any) => {
      console.log('📥 [presence:online]:', data);
      get().fetchChats();
    });

    ws.on('presence:offline', (data: any) => {
      console.log('📥 [presence:offline]:', data);
      get().fetchChats();
    });

    ws.connect();
    set({ ws });
    console.log('✅ [initWS] готово');
  },

  disconnectWS: () => {
    const { ws } = get();
    if (ws) ws.disconnect();
    set({ ws: null });
  },
}));
