import { ArrowRight, Heart, Camera } from 'lucide-react';
import DashboardLayout from '../components/dashboard/Layout';

const team = [
  { id: 1, name: 'Мария Иванова', role: 'Продукт', city: 'Москва', initials: 'МИ' },
  { id: 2, name: 'Дмитрий Смирнов', role: 'Продакт', city: 'Санкт-Петербург', initials: 'ДС' },
  { id: 3, name: 'Ольга Петрова', role: 'Дизайнер', city: 'Казань', initials: 'ОП' },
  { id: 4, name: 'Иван Кузнецов', role: 'Разраб', city: 'Москва', initials: 'ИК' },
];

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Знакомства</h1>
        
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex-shrink-0">Все</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 flex-shrink-0 transition">Дизайнеры</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 flex-shrink-0 transition">Разработчики</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 flex-shrink-0 transition">Маркетологи</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 flex-shrink-0 transition">Иллюстраторы</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
          {team.map(member => (
            <div key={member.id} className="bg-black text-white rounded-2xl overflow-hidden group relative hover:shadow-xl transition-all duration-300">
              <div className="h-64 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                 <span className="text-5xl font-bold opacity-20">{member.initials}</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-zinc-400 mb-4">{member.role} · {member.city}</p>
              </div>
              <button className="absolute bottom-5 right-5 bg-white text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black rounded-3xl p-8 text-white flex flex-col lg:flex-row gap-6 lg:gap-0 lg:justify-between items-start lg:items-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Популярные работы</p>
          <h2 className="text-2xl font-bold mb-2">Веб-платформа для аналитики</h2>
          <div className="flex gap-2 mt-4">
            <button className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold">UI/UX дизайн</button>
            <button className="bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold">Аналитика</button>
          </div>
        </div>
        <div className="flex gap-6 text-zinc-400 relative z-10 mt-4 lg:mt-0">
          <div className="flex items-center gap-1.5"><Heart size={16} /> 128</div>
          <div className="flex items-center gap-1.5"><Camera size={16} /> 24</div>
        </div>
      </div>
    </DashboardLayout>
  );
}