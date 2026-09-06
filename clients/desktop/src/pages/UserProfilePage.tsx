import { useEffect, useState } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../store/useStore';

export const UserProfilePage = ({ userId, onStartChat }: { userId: number; onStartChat: (userId: number) => void }) => {
  const { token } = useStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:8080/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    };
    fetchUser();
  }, [userId, token]);

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <img src={user?.avatar || 'https://i.pravatar.cc/150'} className="w-24 h-24 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-bold">{user?.username || 'Загрузка...'}</h1>
            <p className="text-gray-500">@{user?.username?.toLowerCase()}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onStartChat(userId)}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MessageSquare size={18} /> Написать
          </button>
          <button className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <Phone size={18} /> Позвонить
          </button>
        </div>
      </div>
    </div>
  );
};