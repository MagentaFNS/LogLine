import { useState } from 'react';
import { 
  LayoutDashboard, FileText, MessageSquare, Heart, Briefcase, Bell, User, Settings, Search, ChevronDown, LogOut, Home, Plus
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuItems = [
  { id: 1, label: 'Главная', icon: LayoutDashboard },
  { id: 2, label: 'Заметки', icon: FileText },
  { id: 3, label: 'Чаты', icon: MessageSquare },
  { id: 4, label: 'Закладки', icon: Heart },
  { id: 5, label: 'Работы', icon: Briefcase },
];

export default function DashboardLayout({ children, rightSidebar }: { children: React.ReactNode, rightSidebar?: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState(2);

  return (
    <div className="min-h-screen flex relative">
      {/* Переливающийся фон */}
      <div className="fixed inset-0 bg-animate-gradient animate-gradient-shift opacity-60 pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] text-white flex-col z-20 p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-bold text-xl">L</div>
          <span className="font-extrabold text-xl">LogLine</span>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeItem === item.id 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-zinc-800 pt-4">
          <button className="flex items-center gap-3 text-zinc-400 hover:text-white w-full px-4 py-2 text-sm">
            <Bell size={18} /> Уведомления
          </button>
          <button className="flex items-center gap-3 text-zinc-400 hover:text-white w-full px-4 py-2 text-sm">
            <Settings size={18} /> Настройки
          </button>
          <button className="flex items-center gap-3 text-zinc-400 hover:text-white w-full px-4 py-2 text-sm">
            <LogOut size={18} /> Профиль
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative z-10 p-4 lg:p-10 pb-28 lg:pb-10">
        {/* Topbar */}
        <header className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
            <input 
              type="text" 
              placeholder="Поиск" 
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-zinc-400 transition shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-zinc-200 transition">
              <Bell size={20} className="text-zinc-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                <User size={20} className="text-zinc-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Алексей</span>
                <span className="text-xs text-zinc-500">@alex_logline</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className={cn("flex gap-8", rightSidebar ? "flex-col xl:flex-row" : "")}>
          <div className="flex-1 min-w-0">{children}</div>
          {rightSidebar && (
            <aside className="w-full xl:w-[350px] flex-shrink-0 space-y-6">
              {rightSidebar}
            </aside>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 flex justify-around items-center py-3 pb-safe">
        <button className="text-zinc-400"><Home size={24} /></button>
        <button className="bg-black text-white p-3 rounded-2xl -mt-6 shadow-lg"><Plus size={24} /></button>
        <button className="text-zinc-900"><Heart size={24} /></button>
        <button className="text-zinc-400"><User size={24} /></button>
      </nav>
    </div>
  );
};