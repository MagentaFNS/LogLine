import { LayoutDashboard, StickyNote, MessageSquare, Users, Briefcase, User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { Avatar } from './Avatar';

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const { currentUser, logout, notifications } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menu = [
    { name: 'Главная', icon: <LayoutDashboard size={18} /> },
    { name: 'Заметки', icon: <StickyNote size={18} /> },
    { name: 'Чаты', icon: <MessageSquare size={18} /> },
    { name: 'Знакомства', icon: <Users size={18} /> },
    { name: 'Работы', icon: <Briefcase size={18} /> },
    { name: 'Уведомления', icon: <Bell size={18} /> },
    { name: 'Профиль', icon: <User size={18} /> },
    { name: 'Настройки', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-64 bg-[#111] text-white flex flex-col justify-between p-4 h-screen">
      <div>
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <img src="/favicon.png" alt="LogLine" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-xl font-bold">LogLine</span>
        </div>

        <nav className="space-y-1">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
                activeTab === item.name ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
              {item.name === 'Уведомления' && notifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div
          className="flex items-center gap-3 mb-4 px-2 py-3 bg-white/10 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/20"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <Avatar uri={currentUser?.avatar} username={currentUser?.username} size={40} />
          <div className="flex-1">
            <p className="text-sm font-bold">{currentUser?.username}</p>
            <p className="text-xs text-gray-400">@{currentUser?.username.toLowerCase()}</p>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
        </div>

        {showUserMenu && (
          <div className="bg-white rounded-xl p-2 space-y-1 mb-2 shadow-2xl border border-gray-100 animate-fadeIn">
            <button onClick={() => { setActiveTab('Профиль'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-all">
              <User size={14} /> Профиль
            </button>
            <button onClick={() => { setActiveTab('Настройки'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-all">
              <Settings size={14} /> Настройки
            </button>
            <button onClick={logout} className="w-full text-left px-3 py-2 text-sm font-bold text-black hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-all">
              <LogOut size={14} /> Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};