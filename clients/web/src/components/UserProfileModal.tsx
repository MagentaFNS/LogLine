import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { User } from '../types';

interface Props {
  userId: number | null;
  onClose: () => void;
  onWrite: (user: User) => void;
}

export const UserProfileModal = ({ userId, onClose, onWrite }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    setLoading(true);
    api.get(`/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!userId) return null;

  return (
    <>
      {/* Затемнение */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fadeIn"
        onClick={onClose}
      />

      {/* Модалка */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto animate-scaleIn overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 animate-fadeIn">
              Загрузка...
            </div>
          ) : !user ? (
            <div className="p-12 text-center text-gray-400 animate-fadeIn">
              Пользователь не найден
            </div>
          ) : (
            <>
              {/* Верхняя часть с фоном */}
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-all hover:scale-105 active:scale-95 z-10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Аватар поверх */}
              <div className="relative px-6 pb-6 -mt-16">
                <div className="flex justify-center mb-4">
                  <div className="p-1 bg-white rounded-full shadow-lg animate-scaleIn">
                    <Avatar uri={user.avatar} username={user.username} size={120} />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-1 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                    {user.username}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
                    #{user.id} · {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </p>

                  {user.bio && (
                    <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                      {user.bio}
                    </p>
                  )}

                  <button
                    onClick={() => onWrite(user)}
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 animate-fadeInUp w-full justify-center"
                    style={{ animationDelay: '250ms' }}
                  >
                    <MessageCircle size={18} />
                    Написать сообщение
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
