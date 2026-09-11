import { useState, useEffect, useRef } from 'react';
import { Search, X, MessageCircle, User as UserIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { User } from '../types';

interface Props {
  onSelectUser?: (user: User) => void;
  placeholder?: string;
}

export const UserSearch = ({ onSelectUser, placeholder = 'Поиск пользователей...' }: Props) => {
  const { searchUsers, createPrivateChat, openChat, chats } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce поиск
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      console.log('🔍 [UserSearch] ищу:', query);
      const users = await searchUsers(query);
      console.log('🔍 [UserSearch] найдено:', users.length);
      setResults(users);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = async (user: User) => {
    console.log('🔍 [UserSearch] выбран:', user.username, user.id);

    if (onSelectUser) {
      onSelectUser(user);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Создаём/открываем чат
    const chat = await createPrivateChat(user.id);
    if (chat) {
      const fullChat = chats.find((c) => c.id === chat.id);
      if (fullChat) openChat(fullChat);
      setQuery('');
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} style={{ zIndex: 100 }}>
      {/* Поле поиска */}
      <div
        className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 transition-all duration-300 ${
          isOpen ? 'ring-2 ring-black bg-white shadow-lg' : ''
        }`}
      >
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-0.5 hover:bg-gray-200 rounded transition-all"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Результаты — ПОВЕРХ ВСЕГО */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" style={{ zIndex: 999 }}>
          {isSearching ? (
            <div className="p-6 text-center text-gray-400 text-sm animate-fadeIn">
              Поиск...
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm animate-fadeIn">
              Никого не найдено
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 transition-all animate-fadeInUp border-b border-gray-50 last:border-0"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Avatar uri={user.avatar} username={user.username} size={40} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user.username} <span className="text-xs text-gray-400 font-normal">#{user.id}</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.bio || 'нет описания'}
                    </p>
                  </div>

                  {/* Кнопки действий */}
                  <button
                    onClick={() => handleSelectUser(user)}
                    className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Написать"
                  >
                    <MessageCircle size={14} />
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/user/${user.id}`;
                    }}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Профиль"
                  >
                    <UserIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
