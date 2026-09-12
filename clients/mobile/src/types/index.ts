export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  avatar: string;
  bio: string;
  last_seen: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
}

export interface Post {
  id: number;
  content: string;
  username: string;
  avatar: string;
  likes: number;
  image: string;
  code: string;
  created_at: string;
}

export interface ChatPeer {
  id: number;
  username: string;
  avatar: string;
  bio?: string;
  last_seen: string;
}

export interface Chat {
  id: number;
  type: 'private' | 'group';
  title: string;
  avatar: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  peer?: ChatPeer;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  username: string;
  avatar: string;
  content: string;
  type: string;
  file_url?: string;
  reply_to_id?: number;
  client_msg_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface Work {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  created_at: string;
}
