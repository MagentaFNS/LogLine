// NotificationsPage.tsx
import { Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export const NotificationsPage = () => {
  const { notifications, fetchNotifications } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Уведомления</h1>
      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="bg-white p-6 rounded-2xl text-gray-500">Нет уведомлений.</div>
        )}
        {notifications.map((n) => (
          <div key={n.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p>{n.text}</p>
              <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString('ru-RU')}</p>
            </div>
            {!n.is_read && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Новое</span>}
          </div>
        ))}
      </div>
    </div>
  );
};