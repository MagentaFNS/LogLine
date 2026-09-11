import { useState, useEffect, useRef } from 'react';
import { Search, X, MessageCircle, User as UserIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { User } from '../types';

interface Props {
  onOpenProfile?: (user: User) => void;
  onWriteMessage?: () => void;
}

export const GlobalSearch = ({ onOpenProfile, onWriteMessage }: Props) => {
  const { searchUsers, createPrivateChat, openChat, chats } = useStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      console.log('🔍 [GlobalSearch] ищу:', query);
      const users = await searchUsers(query);
      console.log('🔍 [GlobalSearch] найдено:', users.length);
      setResults(users);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleWrite = async (user: User) => {
    console.log('✉️ [GlobalSearch] пишу:', user.username, user.id);
    const chat = await createPrivateChat(user.id);
    if (chat) {
      const fullChat = chats.find((c) => c.id === chat.id);
      if (fullChat) openChat(fullChat);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      onWriteMessage?.();
    }
  };

  const handleProfile = (user: User) => {
    console.log('👤 [GlobalSearch] профиль:', user.username, user.id);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onOpenProfile?.(user);
  };

  return (
    <div className="relative" ref={containerRef} style={{ zIndex: 100 }}>
      <div
        className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 transition-all duration-300 ${
          isOpen ? 'ring-2 ring-black bg-white shadow-lg w-96' : 'w-64'
        }`}
      >
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Поиск людей..."
          className="bg-transparent outline-none flex-1 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-0.5 hover:bg-gray-200 rounded transition-all"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <>
          <div
            className="fixed inset-0 bg-black/10 z-40 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scaleIn origin-top-right">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {isSearching ? 'Поиск...' : `Найдено: ${results.length}`}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center text-gray-400 text-sm animate-fadeIn">
                  Ищем...
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm animate-fadeIn">
                  Никого не найдено
                </div>
              ) : (
                results.map((user, i) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-50 transition-all animate-fadeInUp border-b border-gray-50 last:border-0"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar uri={user.avatar} username={user.username} size={44} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {user.username}
                          <span className="text-xs text-gray-400 font-normal ml-1">
                            #{user.id}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.bio || 'нет описания'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWrite(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      >
                        <MessageCircle size={14} />
                        Написать
                      </button>
                      <button
                        onClick={() => handleProfile(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      >
                        <UserIcon size={14} />
                        Профиль
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
