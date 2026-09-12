import { MessageCircle, Plus } from 'lucide-react';
import { Avatar } from './Avatar';
import { User } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  user: User;
  onOpenProfile: (user: User) => void;
  onWrite: (user: User) => void;
}

export const UserCard = ({ user, onOpenProfile, onWrite }: Props) => {
  const categoryLabel = CATEGORIES.find((c) => c.id === user.category)?.label || 'Разработчик';

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fadeInUp">

      {/* Верхняя секция: круглый аватар по центру */}
      <div
        className="relative flex items-center justify-center pt-8 pb-4 cursor-pointer"
        onClick={() => onOpenProfile(user)}
      >
        {/* Затемнение — только за аватаром */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 transition-transform duration-500 group-hover:scale-105">
            <Avatar uri={user.avatar} username={user.username} size={128} />
          </div>

          {/* Кнопка + поверх аватарки справа снизу */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWrite(user);
            }}
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-4 border-white transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            title="Написать"
          >
            <Plus size={18} />
          </button>

          {/* Индикатор онлайн */}
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 border-4 border-white" />
        </div>

        {/* Плашка категории вверху слева */}
        {categoryLabel && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wide">
            {categoryLabel}
          </div>
        )}
      </div>

      {/* Нижняя секция: имя, био, кнопка */}
      <div className="px-4 pb-4 text-center">
        {/* Имя */}
        <h3
          className="text-lg font-bold text-gray-900 truncate cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => onOpenProfile(user)}
        >
          {user.username}
        </h3>

        {/* ID мелким */}
        <p className="text-[11px] text-gray-400 mb-2">#{user.id}</p>

        {/* Био */}
        <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-3">
          {user.bio || 'Разработчик LogLine'}
        </p>

        {/* Кнопка Написать */}
        <button
          onClick={() => onWrite(user)}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-gray-800 hover:scale-[1.02] active:scale-95"
        >
          <MessageCircle size={16} />
          Написать
        </button>
      </div>
    </div>
  );
};
