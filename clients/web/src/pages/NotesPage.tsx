import { Plus, Trash2, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export const NotesPage = () => {
  const { notes, createNote, deleteNote } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (title && content) {
      await createNote(title, content);
      setShowModal(false);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Заметки</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-logline-dark text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
        >
          <Plus size={20} /> Создать заметку
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold group-hover:text-gray-900">{note.title}</h3>
              <button 
                onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 transition p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-6 line-clamp-3">{note.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={14} />
              {new Date(note.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Новая заметка</h2>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Заголовок..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
              />
              <textarea 
                placeholder="Текст заметки..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-black">Отмена</button>
                <button onClick={handleCreate} className="bg-logline-dark text-white px-6 py-2 rounded-lg hover:bg-gray-800">Создать</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};