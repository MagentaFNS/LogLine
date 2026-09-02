import { LayoutDashboard, StickyNote, MessageSquare, Settings, Users, User, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { currentUser, logout } = useStore();

  const menuItems = [
    { name: 'Главная', icon: <LayoutDashboard size={18} /> },
    { name: 'Заметки', icon: <StickyNote size={18} /> },
    { name: 'Чаты', icon: <MessageSquare size={18} /> },
    { name: 'Профиль', icon: <User size={18} /> },
    ...(currentUser?.role === 'admin' ? [{ name: 'Админ-панель', icon: <Users size={18} /> }] : []),
    { name: 'Настройки', icon: <Settings size={18} /> }
  ];

  return (
    <div className="w-64 bg-logline-dark text-white flex flex-col justify-between p-4 h-screen">
      <div>
        <div className="flex items-center gap-2 px-2 py-4 mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">L</div>
          <span className="text-xl font-bold tracking-wide">LogLine</span>
        </div>

        <div className="mb-6 px-2">
          <p className="text-xs text-gray-500 mb-1">Профиль</p>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10">
            <div className="w-8 h-8 rounded-full bg-gray-500"></div>
            <div>
              <p className="text-sm font-medium">{currentUser?.username}</p>
              <p className="text-xs text-gray-400">@user</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.name 
                  ? 'bg-white text-black font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <button 
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  );
};