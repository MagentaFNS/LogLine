import { Camera, Lock, User as UserIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ProfilePage = () => {
  const { currentUser } = useStore();

  return (
    <div className="p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>

      <div className="flex gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-72">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img 
              src="https://i.pravatar.cc/300?img=12" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-logline-dark text-white p-2 rounded-full hover:bg-gray-800 transition">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg">{currentUser?.username}</h2>
            <p className="text-gray-500 text-sm">{currentUser?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
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
                defaultValue={currentUser?.username}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>

          <h3 className="font-bold text-lg border-b pb-4 pt-6 flex items-center gap-2">
            <Lock size={18} /> Безопасность
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button className="bg-logline-dark text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition">
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};