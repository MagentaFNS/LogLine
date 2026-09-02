import { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, PenLine, Briefcase, Check, Heart } from 'lucide-react';
import DashboardLayout from '../components/dashboard/Layout';
import { cn } from '../utils/cn';

const tabs = ['Все', 'Личное', 'Работа', 'Идеи'];

const notesData = [
  { id: 1, title: 'Идея мобильного приложения', desc: 'Заметка о концепции и функциях будущего приложения.', tag: 'Идеи', date: '12 мая', icon: PenLine },
  { id: 2, title: 'Маркетинговая стратегия', desc: 'План продвижения и анализа целевой аудитории.', tag: 'Работа', date: '10 мая', icon: Briefcase },
  { id: 3, title: 'Вдохновение', desc: 'Фото, фильмы и цитаты, которые вдохновляют.', tag: 'Личное', date: '8 мая', icon: Heart },
  { id: 4, title: 'Рабочие задачи', desc: 'Текущие задачи и дедлайны проекта.', tag: 'Работа', date: '5 мая', icon: Check },
  { id: 5, title: 'Книги для чтения', desc: 'Список книг, которые хочу прочитать.', tag: 'Личное', date: '1 мая', icon: PenLine },
];

const chats = [
  { id: 1, name: 'Мария Иванова', role: 'клиент', time: '12:40', online: true },
  { id: 2, name: 'Дмитрий Смирнов', role: 'Продакт, создатель', time: '11:42', online: true },
  { id: 3, name: 'Рабочий чат', role: 'Наш чат, работаем', time: '10:18', online: false },
  { id: 4, name: 'Ольга Петрова', role: 'Студия дизайна', time: 'Вчера', online: false },
];

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState('Все');
  const [notes, setNotes] = useState(notesData);

  const filterNotes = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Все') setNotes(notesData);
    else setNotes(notesData.filter(n => n.tag === tab));
  };

  const handleCreate = () => {
    const newNote = {
      id: Date.now(),
      title: 'Новая заметка',
      desc: 'Начните печатать...',
      tag: 'Идеи',
      date: 'Сегодня',
      icon: PenLine
    };
    setNotes([newNote, ...notes]);
    setActiveTab('Все');
  };

  const rightSidebar = (
    <>
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">Среда, 15 мая</h3>
        <p className="text-2xl font-bold text-zinc-900 mb-4">Добрый день, Алексей!</p>
        <p className="text-sm text-zinc-500">«Фокус» — это выбор того, что важнее.</p>
        <svg viewBox="0 0 100 50" className="w-full h-16 mt-4 text-zinc-200">
          <path d="M0 40 Q 20 20, 40 30 T 80 10 T 100 20" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Активные чаты</h3>
          <button className="text-xs text-zinc-500 hover:text-zinc-900">Перейти в чаты</button>
        </div>

        <div className="space-y-4">
          {chats.map(chat => (
            <div key={chat.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center relative">
                   <span className="text-sm font-bold text-zinc-500">{chat.name[0]}</span>
                   {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"/>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{chat.name}</p>
                  <p className="text-xs text-zinc-500">{chat.role}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-400">{chat.time}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={handleCreate}
        className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-zinc-800 transition shadow-lg flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Создать заметку
      </button>
    </>
  );

  return (
    <DashboardLayout rightSidebar={rightSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 tracking-tight hidden lg:block">Заметки</h1>
        <h1 className="text-2xl font-bold mb-4 tracking-tight lg:hidden">Заметки</h1>
        
        <div className="flex gap-2 mb-8">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => filterNotes(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === tab 
                  ? "bg-black text-white shadow-md" 
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {notes.map(note => (
            <div 
              key={note.id} 
              className="bg-white border border-zinc-200 rounded-2xl p-4 lg:p-5 flex gap-4 hover:shadow-md hover:border-zinc-300 transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                 <note.icon size={24} className="text-zinc-600" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition text-sm lg:text-base">{note.title}</h3>
                  <button className="text-zinc-400 hover:text-black transition">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-2">{note.desc}</p>
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>{note.tag}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {note.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}