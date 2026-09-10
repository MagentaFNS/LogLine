import { Camera, Lock, User as UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';

export const ProfilePage = () => {
  const { currentUser, updateAvatar, updateProfile } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateAvatar(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    await updateProfile(username, bio);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>

      <div className="flex gap-8 items-start">
        {/* Карточка аватара */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-72">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black">
              <Avatar
                uri={currentUser?.avatar}
                username={currentUser?.username}
                size={128}
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="text-center">
            <h2 className="font-bold text-lg">{currentUser?.username}</h2>
            <p className="text-xs text-gray-500">{currentUser?.role}</p>
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-1 space-y-6">
          <h3 className="font-bold text-lg border-b pb-4 flex items-center gap-2">
            <UserIcon size={18} /> Личные данные
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Био
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>

          <h3 className="font-bold text-lg border-b pb-4 pt-6 flex items-center gap-2">
            <Lock size={18} /> Безопасность
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};