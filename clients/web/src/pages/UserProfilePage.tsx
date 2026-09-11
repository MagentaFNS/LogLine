import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { User } from '../types';

export const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createPrivateChat, openChat, chats } = useStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/users/${id}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleWrite = async () => {
    if (!user) return;
    const chat = await createPrivateChat(user.id);
    if (chat) {
      const fullChat = chats.find((c) => c.id === chat.id);
      if (fullChat) openChat(fullChat);
      navigate('/chats');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 animate-fadeIn">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 animate-fadeIn">
        <p className="text-gray-400">Пользователь не найден</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#f5f5f7]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-500 hover:text-black transition-all"
      >
        <ArrowLeft size={18} />
        Назад
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm animate-scaleIn">
          <div className="mx-auto mb-4 animate-fadeInUp">
            <Avatar uri={user.avatar} username={user.username} size={120} />
          </div>

          <h1 className="text-3xl font-bold mb-1 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            {user.username}
          </h1>
          <p className="text-gray-400 text-sm mb-6 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
            #{user.id} · {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </p>

          {user.bio && (
            <p className="text-gray-600 mb-6 max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {user.bio}
            </p>
          )}

          <button
            onClick={handleWrite}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 animate-fadeInUp"
            style={{ animationDelay: '250ms' }}
          >
            <MessageCircle size={18} />
            Написать сообщение
          </button>
        </div>
      </div>
    </div>
  );
};
