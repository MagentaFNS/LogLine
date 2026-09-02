export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}