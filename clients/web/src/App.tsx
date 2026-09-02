import { useState } from 'react';
import NotesPage from './pages/NotesPage';
import ProjectsPage from './pages/ProjectsPage';

function App() {
  const [page, setPage] = useState<'notes' | 'projects'>('notes');

  return (
    <div>
      {page === 'notes' ? <NotesPage /> : <ProjectsPage />}
      
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 rounded-full p-1 shadow-2xl z-50 flex gap-1">
        <button 
          onClick={() => setPage('notes')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${page === 'notes' ? 'bg-black text-white' : 'text-zinc-600'}`}
        >
          Заметки
        </button>
        <button 
          onClick={() => setPage('projects')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${page === 'projects' ? 'bg-black text-white' : 'text-zinc-600'}`}
        >
          Проекты
        </button>
      </div>
    </div>
  );
}

export default App;