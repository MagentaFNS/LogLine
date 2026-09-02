import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { User } from '../types';

export const AdminPage = () => {
  const { token, currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ notes: 0, users: 0 });

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    const fetchData = async () => {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    };

    fetchData();
  }, [token, currentUser]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-logline-dark text-white rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-4xl font-bold">{stats.users}</p>
            <p className="text-gray-400">Всего пользователей</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-xl"><FileText size={24} /></div>
          <div>
            <p className="text-4xl font-bold text-gray-800">{stats.notes}</p>
            <p className="text-gray-500">Всего заметок</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <ShieldCheck size={20} className="text-green-600" />
          <h2 className="font-bold">Список пользователей</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Имя</th>
              <th className="px-6 py-3">Роль</th>
              <th className="px-6 py-3">Дата регистрации</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                <td className="px-6 py-4 font-medium">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};