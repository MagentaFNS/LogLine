import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { UserCard } from '../components/UserCard';
import { UserProfileModal } from '../components/UserProfileModal';
import { User } from '../types';
import { CATEGORIES } from '../constants';

const FILTERS = [
  { id: 'all', label: 'Все' },
  ...CATEGORIES,
];

interface Props {
  setActiveTab?: (tab: string) => void;
}

export const MatchesPage = ({ setActiveTab }: Props) => {
  const { users, usersTotal, fetchUsers, createPrivateChat, openChat, chats, addToast } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [profileUserId, setProfileUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers(true, activeFilter);
  }, [activeFilter]);

  const handleWrite = async (user: User) => {
    const chat = await createPrivateChat(user.id);
    if (chat) {
      const fullChat = chats.find((c) => c.id === chat.id);
      if (fullChat) openChat(fullChat);
      setProfileUserId(null);
      addToast(`Чат с ${user.username} открыт`, 'success');
      if (setActiveTab) {
        setActiveTab('Чаты');
      } else {
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'Чаты' }));
      }
    } else {
      addToast('Не удалось создать чат', 'error');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#f5f5f7]">
      <div className="mb-6 animate-fadeInDown">
        <h1 className="text-3xl font-bold tracking-tight">Знакомства</h1>
        <p className="text-gray-500 text-sm mt-1">
          Найди разработчиков, дизайнеров и менеджеров
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 animate-fadeInUp">
        {FILTERS.map((filter, i) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeFilter === filter.id
                ? 'bg-black text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 text-gray-400 animate-fadeIn">
          <p className="text-lg font-semibold mb-2">Пока никого нет</p>
          <p className="text-sm">Приглашай друзей в LogLine</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onOpenProfile={(u) => setProfileUserId(u.id)}
                onWrite={handleWrite}
              />
            ))}
          </div>

          {users.length < usersTotal && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchUsers(false, activeFilter)}
                className="px-6 py-3 bg-white rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              >
                Показать ещё
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            Показано {users.length} из {usersTotal}
          </p>
        </>
      )}

      <UserProfileModal
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
        onWrite={handleWrite}
      />
    </div>
  );
};
