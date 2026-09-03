export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  avatar: string;
  bio: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
}

export interface Work {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
}

export interface Post {
  id: number;
  content: string;
  username: string;
  avatar: string;
  likes: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

export interface Notification {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}