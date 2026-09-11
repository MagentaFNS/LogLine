import { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';

export const NotificationBell = () => {
  const { chatNotifications, chats, openChat } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const total = Object.values(chatNotifications).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChatClick = (chatId: number) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      openChat(chat);
      setIsOpen(false);
    }
  };

  const chatsWithNotifications = chats.filter(
    (chat) => chatNotifications[chat.id] > 0
  );

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Bell size={20} className={total > 0 ? 'animate-pulse' : ''} />
        {total > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn shadow-lg">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Затемнение */}
          <div
            className="fixed inset-0 bg-black/10 z-40 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Дропдаун поверх */}
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scaleIn origin-top-right">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold">Уведомления</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {chatsWithNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm animate-fadeIn">
                  Нет новых уведомлений
                </div>
              ) : (
                chatsWithNotifications.map((chat, i) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-all animate-fadeInUp border-b border-gray-50 last:border-0"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Avatar
                      uri={chat.peer?.avatar || chat.avatar}
                      username={chat.peer?.username || chat.title}
                      size={40}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {chat.peer?.username || chat.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">новое сообщение</p>
                    </div>
                    <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {chatNotifications[chat.id]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
