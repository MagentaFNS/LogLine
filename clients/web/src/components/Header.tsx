import { Search, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Header = ({ activeTab }: { activeTab: string }) => {
  const { currentUser } = useStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">{activeTab}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск..." 
            className="bg-gray-50 pl-10 pr-4 py-2 rounded-xl outline-none w-64 focus:bg-white focus:ring-2 focus:ring-gray-200 transition"
          />
        </div>
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold">{currentUser?.username}</p>
            <p className="text-xs text-gray-500">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};