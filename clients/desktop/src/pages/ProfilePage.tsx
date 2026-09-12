import { useState, useRef } from 'react';
import { Camera, Lock, User as UserIcon, Briefcase } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { CATEGORIES } from '../constants';

export const ProfilePage = () => {
  const { currentUser, updateAvatar, updateProfile, addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [category, setCategory] = useState(currentUser?.category || '');
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateAvatar(e.target.files[0]);
      addToast('Аватар обновлён', 'success');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(username, bio, category);
      addToast('Профиль сохранён', 'success');
    } catch (e) {
      addToast('Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  };

  const firstLetter = currentUser?.username?.[0]?.toUpperCase() || '?';
  const avatarUrl = currentUser?.avatar;
  const currentCategoryLabel = CATEGORIES.find((c) => c.id === currentUser?.category)?.label;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>

      <div className="flex gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-80">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black bg-black flex items-center justify-center">
              {avatarUrl ? (
                <Avatar uri={avatarUrl} username={currentUser?.username} size={128} />
              ) : (
                <span className="text-white text-4xl font-bold">{firstLetter}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-black text-white p-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-110"
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
            <p className="text-xs text-gray-500 mb-2">#{currentUser?.id}</p>
            {currentCategoryLabel && (
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                {currentCategoryLabel}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-1 space-y-6">
          <h3 className="font-bold text-lg border-b pb-4 flex items-center gap-2">
            <UserIcon size={18} /> Личные данные
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажи о себе..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Briefcase size={14} /> Специализация
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat.id
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h3 className="font-bold text-lg border-b pb-4 pt-6 flex items-center gap-2">
            <Lock size={18} /> Безопасность
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
};
