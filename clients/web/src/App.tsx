import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePages';
import { NotesPage } from './pages/NotesPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { JobsPage } from './pages/JobsPage';
import { MatchesPage } from './pages/MatchesPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

function App() {
  const { currentUser, token, fetchNotes, fetchNotifications } = useStore();
  const [activeTab, setActiveTab] = useState('Главная');

  useEffect(() => {
    if (token) {
      fetchNotes();
      fetchNotifications();
    }
  }, [token]);

  if (!currentUser) return <LoginPage />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f4f4]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-hidden">
          <div key={activeTab} className="h-full fade-in-up">
            {activeTab === 'Главная' && <HomePage />}
            {activeTab === 'Заметки' && <NotesPage />}
            {activeTab === 'Чаты' && <ChatPage />}
            {activeTab === 'Знакомства' && <MatchesPage />}
            {activeTab === 'Работы' && <JobsPage />}
            {activeTab === 'Профиль' && <ProfilePage />}
            {activeTab === 'Админ-панель' && <AdminPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;