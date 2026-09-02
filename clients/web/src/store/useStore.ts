import { create } from 'zustand';
import axios from 'axios';
import { User, Note } from '../types';

const API = 'http://localhost:8080/api';

interface State {
  token: string | null;
  currentUser: User | null;
  notes: Note[];
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  token: localStorage.getItem('token'),
  currentUser: null,
  notes: [],
  isAdmin: false,

  login: async (username, password) => {
    const res = await axios.post(`${API}/login`, { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    set({ token, currentUser: user, isAdmin: user.role === 'admin' });
  },

  register: async (username, password) => {
    const res = await axios.post(`${API}/register`, { username, password });
    // Сразу логинимся после регистрации
    await get().login(username, password);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, currentUser: null, isAdmin: false });
  },

  fetchNotes: async () => {
    const res = await axios.get(`${API}/notes`, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    set({ notes: res.data });
  },

  createNote: async (title, content) => {
    await axios.post(`${API}/notes`, { title, content }, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    await get().fetchNotes();
  },

  deleteNote: async (id) => {
    await axios.delete(`${API}/notes/${id}`, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    await get().fetchNotes();
  }
}));