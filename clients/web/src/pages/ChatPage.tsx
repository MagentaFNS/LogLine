import { useEffect, useState, useRef } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { Chat, User } from '../types';

export const ChatPage = () => {
  const {
    currentUser,
    chats,
    currentChat,
    messages,
    typingUsers,
    fetchChats,
    openChat,
    closeChat,
    sendMessage,
    createPrivateChat,
    searchUsers,
  } = useStore();

  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    console.log('🟣 [ChatPage] mounted, fetchChats()');
    fetchChats();
  }, []);

  useEffect(() => {
    console.log('🟣 [ChatPage] messages изменились, длина:', messages.length);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Поиск пользователей с debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const users = await searchUsers(searchQuery);
      setSearchResults(users);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSend = () => {
    console.log('🟢 [ChatPage] handleSend вызван, text:', JSON.stringify(text));
    if (!text.trim()) {
      console.log('❌ [ChatPage] текст пустой');
      return;
    }
    console.log('🟢 [ChatPage] вызываю sendMessage');
    sendMessage(text);
    setText('');

    const ws = useStore.getState().ws;
    if (ws && currentChat) {
      ws.send('typing:stop', { chat_id: currentChat.id });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ [ChatPage] key:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (value: string) => {
    setText(value);
    const ws = useStore.getState().ws;
    if (!ws || !currentChat) return;

    ws.send('typing:start', { chat_id: currentChat.id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      ws.send('typing:stop', { chat_id: currentChat.id });
    }, 2000);
  };

  const handleStartChat = async (user: User) => {
    console.log('🟣 [ChatPage] handleStartChat с:', user.username, user.id);
    const chat = await createPrivateChat(user.id);
    if (chat) {
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      const fullChat = useStore.getState().chats.find((c) => c.id === chat.id);
      if (fullChat) openChat(fullChat);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (iso?: string) => {
    if (!iso || iso.startsWith('0001')) return 'недавно';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'в сети';
    if (mins < 60) return `был(а) ${mins} мин назад`;
    if (mins < 1440) return `был(а) ${Math.floor(mins / 60)} ч назад`;
    return `был(а) ${Math.floor(mins / 1440)} дн назад`;
  };

  const isTyping = typingUsers.size > 0;

  return (
    <div className="h-full flex p-4 gap-4 bg-[#f5f5f7]">
      {/* === ЛЕВАЯ КОЛОНКА: СПИСОК ЧАТОВ === */}
      <div className="w-[340px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Чаты</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
            >
              {showSearch ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>

          {showSearch ? (
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск людей по имени..."
              className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                placeholder="Поиск по чатам"
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {showSearch && searchResults.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Люди</p>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <Avatar uri={user.avatar} username={user.username} size={40} />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.bio || 'нет описания'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!showSearch && chats.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Нет чатов. Нажми <span className="font-bold">+</span> чтобы начать.
            </div>
          )}

          {!showSearch && chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => openChat(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                currentChat?.id === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <Avatar
                uri={chat.peer?.avatar || chat.avatar}
                username={chat.peer?.username || chat.title}
                size={48}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">
                    {chat.peer?.username || chat.title || 'Чат'}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {formatTime(chat.updated_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {chat.peer ? formatLastSeen(chat.peer.last_seen) : 'группа'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* === ЦЕНТР: ОКНО ЧАТА === */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Выбери чат</p>
              <p className="text-sm">Или найди пользователя через + слева</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  uri={currentChat.peer?.avatar || currentChat.avatar}
                  username={currentChat.peer?.username || currentChat.title}
                  size={44}
                />
                <div>
                  <h3 className="font-bold">{currentChat.peer?.username || currentChat.title}</h3>
                  <p className={`text-xs ${isTyping ? 'text-blue-500' : 'text-green-500'}`}>
                    {isTyping ? 'печатает...' : formatLastSeen(currentChat.peer?.last_seen)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone size={18} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><Video size={18} /></button>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Info size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={18} /></button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  Нет сообщений. Напишите первым!
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.user_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine
                          ? 'bg-black text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                        {formatTime(msg.created_at)}
                        {isMine && <span className="ml-1">✓✓</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-xl">
                <Paperclip size={20} className="text-gray-500" />
              </button>
              <input
                type="text"
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
              <button className="p-2 hover:bg-gray-100 rounded-xl">
                <Smile size={20} className="text-gray-500" />
              </button>
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* === ПРАВАЯ КОЛОНКА: ПРОФИЛЬ === */}
      {showProfile && currentChat?.peer && (
        <div className="w-[320px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-y-auto">
          <div className="p-6 text-center border-b border-gray-100">
            <div className="mx-auto mb-3">
              <Avatar
                uri={currentChat.peer.avatar}
                username={currentChat.peer.username}
                size={80}
              />
            </div>
            <h3 className="font-bold text-lg">{currentChat.peer.username}</h3>
            <p className="text-xs text-gray-500 mb-4">
              {formatLastSeen(currentChat.peer.last_seen)}
            </p>
            <div className="flex justify-center gap-2">
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16">
                <Phone size={18} />
                <span className="text-[10px]">Позвонить</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16">
                <Video size={18} />
                <span className="text-[10px]">Видео</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16">
                <Info size={18} />
                <span className="text-[10px]">Профиль</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16">
                <MoreVertical size={18} />
                <span className="text-[10px]">Ещё</span>
              </button>
            </div>
          </div>

          {currentChat.peer.bio && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">О себе</p>
              <p className="text-sm">{currentChat.peer.bio}</p>
            </div>
          )}

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Файлы и ссылки</p>
              <button className="text-xs text-gray-400 hover:text-black">Смотреть все</button>
            </div>
            <p className="text-sm text-gray-400">Пока нет файлов</p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Общие заметки</p>
              <button className="text-xs text-gray-400 hover:text-black">Смотреть все</button>
            </div>
            <p className="text-sm text-gray-400">Пока нет заметок</p>
          </div>
        </div>
      )}
    </div>
  );
};
