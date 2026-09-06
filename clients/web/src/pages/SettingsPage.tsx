// SettingsPage.tsx
import { Settings, Sun, Moon, Lock, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export const SettingsPage = () => {
  const { updateProfile, currentUser } = useStore();
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [username, setUsername] = useState(currentUser?.username || '');

  const handleSave = async () => {
    await updateProfile(username, bio);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Настройки</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="font-bold mb-6 flex items-center gap-2">
          <User size={18} /> Аккаунт
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border p-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Био</label>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border p-2 rounded-lg mt-1"
            />
          </div>
          <button onClick={handleSave} className="bg-black text-white px-4 py-2 rounded-lg">
            Сохранить
          </button>
        </div>

        <h2 className="font-bold mt-8 mb-6 flex items-center gap-2">
          <Lock size={18} /> Безопасность
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Пароль</label>
            <input type="password" placeholder="••••••" className="w-full border p-2 rounded-lg mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};