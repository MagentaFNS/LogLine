import { useEffect, useState, useRef } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, Plus, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { TypingIndicator } from '../components/TypingIndicator';
import { AnimatedMessage } from '../components/AnimatedMessage';
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
    sendMessage,
    createPrivateChat,
    searchUsers,
  } = useStore();

  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

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
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    const ws = useStore.getState().ws;
    if (ws && currentChat) {
      ws.send('typing:stop', { chat_id: currentChat.id });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    const chat = await createPrivateChat(user.id);
    if (chat) {
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      const fullChat = useStore.getState().chats.find((c) => c.id === chat.id);
      if (fullChat) {
        openChat(fullChat);
        setShowChatOnMobile(true);
      }
    }
  };

  const handleOpenChat = (chat: Chat) => {
    openChat(chat);
    setShowChatOnMobile(true);
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
    <div className="h-full flex p-4 gap-4 bg-[#f5f5f7] overflow-hidden">
      {/* === ЛЕВАЯ КОЛОНКА: СПИСОК ЧАТОВ === */}
      <div className={`w-[340px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideInLeft shadow-sm ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Чаты</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
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
              className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition-all animate-fadeIn"
            />
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-black">
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
            <div className="animate-fadeIn">
              <p className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Люди</p>
              {searchResults.map((user, i) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all animate-fadeInUp"
                  style={{ animationDelay: `${i * 50}ms` }}
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
            <div className="p-8 text-center text-gray-400 text-sm animate-fadeIn">
              Нет чатов. Нажми <span className="font-bold">+</span> чтобы начать.
            </div>
          )}

          {!showSearch && chats.map((chat, i) => (
            <button
              key={chat.id}
              onClick={() => handleOpenChat(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:bg-gray-50 animate-fadeInUp ${
                currentChat?.id === chat.id ? 'bg-gray-100' : ''
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
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
      <div className={`flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleIn shadow-sm ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center animate-fadeIn">
              <p className="text-lg font-semibold mb-2">Выбери чат</p>
              <p className="text-sm">Или найди пользователя через + слева</p>
            </div>
          </div>
        ) : (
          <>
            {/* Шапка чата с аватаром по центру */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between animate-fadeInDown">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="cursor-pointer transition-transform duration-300 hover:scale-105">
                  <Avatar
                    uri={currentChat.peer?.avatar || currentChat.avatar}
                    username={currentChat.peer?.username || currentChat.title}
                    size={44}
                  />
                </div>
                <div>
                  <h3 className="font-bold">{currentChat.peer?.username || currentChat.title}</h3>
                  <p className={`text-xs transition-colors duration-300 ${isTyping ? 'text-blue-500' : 'text-green-500'}`}>
                    {isTyping ? 'печатает...' : formatLastSeen(currentChat.peer?.last_seen)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
                  <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
                  <Video size={18} />
                </button>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    showProfile ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Info size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8 animate-fadeIn">
                  Нет сообщений. Напишите первым!
                </div>
              )}
              {messages.map((msg) => (
                <AnimatedMessage
                  key={msg.id}
                  msg={msg}
                  isMine={msg.user_id === currentUser?.id}
                  formatTime={formatTime}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-3 animate-fadeInUp">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95">
                <Paperclip size={20} className="text-gray-500" />
              </button>
              <input
                type="text"
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
              />
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95">
                <Smile size={20} className="text-gray-500" />
              </button>
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* === ПРАВАЯ КОЛОНКА: ПРОФИЛЬ === */}
      {showProfile && currentChat?.peer && (
        <div className="w-[320px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-y-auto animate-slideInRight shadow-lg">
          {/* Профиль с аватаром по центру */}
          <div className="p-6 text-center border-b border-gray-100 animate-fadeInDown">
            <div className="mx-auto mb-4 flex justify-center">
              <div className="transition-transform duration-500 hover:scale-110">
                <Avatar
                  uri={currentChat.peer.avatar}
                  username={currentChat.peer.username}
                  size={96}
                />
              </div>
            </div>
            <h3 className="font-bold text-lg animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              {currentChat.peer.username}
            </h3>
            <p className="text-xs text-gray-500 mb-4 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
              {formatLastSeen(currentChat.peer.last_seen)}
            </p>
            <div className="flex justify-center gap-2 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16 transition-all duration-200 hover:scale-105 active:scale-95">
                <Phone size={18} />
                <span className="text-[10px]">Позвонить</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16 transition-all duration-200 hover:scale-105 active:scale-95">
                <Video size={18} />
                <span className="text-[10px]">Видео</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16 transition-all duration-200 hover:scale-105 active:scale-95">
                <Info size={18} />
                <span className="text-[10px]">Профиль</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 w-16 transition-all duration-200 hover:scale-105 active:scale-95">
                <MoreVertical size={18} />
                <span className="text-[10px]">Ещё</span>
              </button>
            </div>
          </div>

          {currentChat.peer.bio && (
            <div className="p-4 border-b border-gray-100 animate-fadeInUp" style={{ animationDelay: '250ms' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">О себе</p>
              <p className="text-sm">{currentChat.peer.bio}</p>
            </div>
          )}

          <div className="p-4 border-b border-gray-100 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Файлы и ссылки</p>
              <button className="text-xs text-gray-400 hover:text-black transition-colors">Смотреть все</button>
            </div>
            <p className="text-sm text-gray-400">Пока нет файлов</p>
          </div>

          <div className="p-4 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Общие заметки</p>
              <button className="text-xs text-gray-400 hover:text-black transition-colors">Смотреть все</button>
            </div>
            <p className="text-sm text-gray-400">Пока нет заметок</p>
          </div>
        </div>
      )}
    </div>
  );
};
