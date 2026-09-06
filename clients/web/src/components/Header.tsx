import { Search, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const Header = ({ activeTab, onOpenUserProfile }: { activeTab: string; onOpenUserProfile: (id: number) => void }) => {
  const { currentUser, token, notifications, fetchNotifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const res = await axios.get(`http://localhost:8080/api/search-users?q=${query}`);
    setSearchResults(res.data);
    setShowSearchResults(true);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">{activeTab}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск людей..."
            className="bg-gray-50 pl-10 pr-4 py-2 rounded-xl outline-none w-64 focus:bg-white focus:ring-2 focus:ring-gray-200 transition"
          />
          {showSearchResults && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
              {searchResults.length === 0 && <div className="p-4 text-gray-500 text-sm">Нет пользователей</div>}
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onOpenUserProfile(user.id);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full p-3 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                >
                  <img src={user.avatar || 'https://i.pravatar.cc/100'} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username.toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition relative">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Уведомления</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-80">
                {notifications.length === 0 && <div className="text-gray-500 text-center py-8">Нет уведомлений</div>}
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-xl hover:bg-gray-50">
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src={currentUser?.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold">{currentUser?.username}</p>
            <p className="text-xs text-gray-500">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};