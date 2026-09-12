import { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Paperclip } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { AnimatedMessage } from '../components/AnimatedMessage';
import { Chat } from '../types';

interface Props {
  chat: Chat;
  onBack: () => void;
}

export const ChatScreen = ({ chat, onBack }: Props) => {
  const { currentUser, messages, openChat, closeChat, sendMessage, typingUsers, ws } = useStore();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingTimerRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    openChat(chat);
    return () => closeChat();
  }, [chat.id]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const handleChange = (value: string) => {
    setText(value);
    if (!ws || !chat) return;
    ws.send('typing:start', { chat_id: chat.id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      ws.send('typing:stop', { chat_id: chat.id });
    }, 2000);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const isTyping = typingUsers.size > 0;
  const TAB_BAR_HEIGHT = 100;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Avatar uri={chat.peer?.avatar} username={chat.peer?.username} size={40} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat.peer?.username || 'Чат'}</Text>
          <Text style={[styles.headerStatus, isTyping && { color: '#3b82f6' }]}>
            {isTyping ? 'печатает...' : 'в сети'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.messagesList, { paddingBottom: TAB_BAR_HEIGHT + 20 }]}
        renderItem={({ item }) => (
          <AnimatedMessage
            item={item}
            isMine={item.user_id === currentUser?.id}
            formatTime={formatTime}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет сообщений</Text>
            <Text style={styles.emptyHint}>Напиши первым!</Text>
          </View>
        }
      />

      <View style={[styles.inputContainer, { paddingBottom: TAB_BAR_HEIGHT + 8 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Paperclip size={22} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleChange}
            placeholder="Сообщение..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#000' },
  headerStatus: { fontSize: 12, color: '#22c55e' },
  messagesList: { padding: 16 },
  inputContainer: {
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  iconBtn: { padding: 8 },
  input: {
    flex: 1, backgroundColor: '#f5f5f7', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    fontSize: 15, color: '#000',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#000', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.3 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#666' },
  emptyHint: { fontSize: 14, color: '#999', marginTop: 4 },
});
