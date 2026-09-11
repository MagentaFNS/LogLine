import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';
import { User } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: (user: User) => void;
}

export const Header = ({ activeTab, setActiveTab, onOpenProfile }: Props) => {
  const { currentUser } = useStore();

  const handleWriteMessage = () => {
    setActiveTab('Чаты');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">{activeTab}</h2>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearch
          onOpenProfile={onOpenProfile}
          onWriteMessage={handleWriteMessage}
        />
        <NotificationBell />

        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-all duration-300 hover:scale-105">
          <Avatar
            uri={currentUser?.avatar}
            username={currentUser?.username}
            size={40}
          />
          <div className="hidden lg:block">
            <p className="text-sm font-bold">{currentUser?.username}</p>
            <p className="text-xs text-gray-500">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
