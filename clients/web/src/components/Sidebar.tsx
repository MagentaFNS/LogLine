import { LayoutDashboard, StickyNote, MessageSquare, Users, Briefcase, User, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const { currentUser, logout, notifications } = useStore();

  const menu = [
    { name: 'Главная', icon: <LayoutDashboard size={18} /> },
    { name: 'Заметки', icon: <StickyNote size={18} /> },
    { name: 'Чаты', icon: <MessageSquare size={18} /> },
    { name: 'Знакомства', icon: <Users size={18} /> },
    { name: 'Работы', icon: <Briefcase size={18} /> },
    { name: 'Профиль', icon: <User size={18} /> },
    { name: 'Настройки', icon: <Settings size={18} /> },
  ];

  return (
  <div className="w-64 bg-[#111] text-white flex flex-col justify-between p-4 h-screen">
    <div>
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <img
            src="/favicon.png"
            alt="Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <span className="text-xl font-bold">LogLine</span>
      </div>

        <nav className="space-y-1">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.name ? 'bg-white text-black font-bold' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
              {item.name === 'Главная' && notifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{notifications.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4 px-2 py-3 bg-white/10 rounded-xl">
          <img src={currentUser?.avatar} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <p className="text-sm font-bold">{currentUser?.username}</p>
            <p className="text-xs text-gray-400">@{currentUser?.username.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl">
          <LogOut size={18} /> Выйти
        </button>
      </div>
    </div>
  );
};