import { create } from 'zustand';
import axios from 'axios';
import { User, Note, Post, Notification, Work } from '../types';

const API = 'http://localhost:8080/api';

interface State {
  token: string | null;
  currentUser: User | null;
  notes: Note[];
  posts: Post[];
  notifications: Notification[];
  works: Work[];
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (file: File) => Promise<void>;
  updateProfile: (username: string, bio: string) => Promise<void>;
  fetchNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  fetchPosts: () => Promise<void>;
  createPost: (content: string) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  fetchWorks: () => Promise<void>;
  createWork: (title: string, company: string, location: string, salary: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  token: localStorage.getItem('token'),
  currentUser: null,
  notes: [],
  posts: [],
  notifications: [],
  works: [],
  isAdmin: false,

  login: async (username, password) => {
    const res = await axios.post(`${API}/login`, { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    set({ token, currentUser: user, isAdmin: user.role === 'admin' });
    get().fetchPosts();
    get().fetchWorks();
    get().fetchNotifications();
  },

  register: async (username, password) => {
    const res = await axios.post(`${API}/register`, { username, password });
    await get().login(username, password);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, currentUser: null, isAdmin: false });
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axios.post(`${API}/upload/avatar`, formData, {
      headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'multipart/form-data' }
    });
    set(state => ({ currentUser: { ...state.currentUser!, avatar: res.data.avatar } }));
  },

  updateProfile: async (username, bio) => {
    const res = await axios.post(`${API}/update-profile`, { username, bio }, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    set(state => ({ currentUser: { ...state.currentUser!, username: res.data.username, bio: res.data.bio } }));
  },

  fetchNotes: async () => {
    const res = await axios.get(`${API}/notes`, { headers: { Authorization: `Bearer ${get().token}` } });
    set({ notes: res.data });
  },

  createNote: async (title, content) => {
    await axios.post(`${API}/notes`, { title, content }, { headers: { Authorization: `Bearer ${get().token}` } });
    await get().fetchNotes();
  },

  deleteNote: async (id) => {
    await axios.delete(`${API}/notes/${id}`, { headers: { Authorization: `Bearer ${get().token}` } });
    await get().fetchNotes();
  },

  fetchPosts: async () => {
    const res = await axios.get(`${API}/posts`, { headers: { Authorization: `Bearer ${get().token}` } });
    set({ posts: res.data });
  },

  createPost: async (content) => {
    await axios.post(`${API}/posts`, { content }, { headers: { Authorization: `Bearer ${get().token}` } });
    await get().fetchPosts();
  },

  likePost: async (id) => {
    await axios.post(`${API}/posts/${id}/like`, {}, { headers: { Authorization: `Bearer ${get().token}` } });
    await get().fetchPosts();
  },

  fetchWorks: async () => {
    const res = await axios.get(`${API}/works`, { headers: { Authorization: `Bearer ${get().token}` } });
    set({ works: res.data });
  },

  createWork: async (title, company, location, salary) => {
    await axios.post(`${API}/works`, { title, company, location, salary }, { headers: { Authorization: `Bearer ${get().token}` } });
    await get().fetchWorks();
  },

  fetchNotifications: async () => {
    const res = await axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${get().token}` } });
    set({ notifications: res.data });
  }
}));