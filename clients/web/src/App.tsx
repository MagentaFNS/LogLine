import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { NotesPage } from './pages/NotesPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Search, Bell } from 'lucide-react';

function App() {
  const { currentUser, token, fetchNotes } = useStore();
  const [activeTab, setActiveTab] = useState('Заметки');

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-logline-light">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />

        {/* Плавная смена контента */}
        <main className="flex-1 overflow-hidden">
          <div key={activeTab} className="h-full fade-in-up">
            {activeTab === 'Заметки' && <NotesPage />}
            {activeTab === 'Чаты' && <ChatPage />}
            {activeTab === 'Админ-панель' && <AdminPage />}
            {activeTab === 'Профиль' && <ProfilePage />}
            {activeTab === 'Главная' && (
              <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Добро пожаловать, {currentUser.username}!</h1>
                <p className="text-gray-500">Выберите раздел в меню слева.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;