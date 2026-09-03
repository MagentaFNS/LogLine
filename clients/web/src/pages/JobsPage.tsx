import { Briefcase, MapPin, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export const JobsPage = () => {
  const { works, createWork, currentUser } = useStore();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Работы</h1>
        <div className="space-y-4">
          {works.map((work) => (
            <div key={work.id} className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold">{work.title}</h3>
              <p className="text-gray-500">{work.company}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={14} /> {work.location}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> Полная занятость</span>
              </div>
              <p className="mt-2 font-bold text-green-600">{work.salary}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Работы</h1>
      <div className="bg-white p-4 rounded-2xl mb-6 border border-gray-100">
        <h3 className="font-bold mb-4">Добавить вакансию (Админ)</h3>
        <div className="grid grid-cols-2 gap-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="border p-2 rounded-lg" />
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Компания" className="border p-2 rounded-lg" />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Место" className="border p-2 rounded-lg" />
          <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="Зарплата" className="border p-2 rounded-lg" />
        </div>
        <button onClick={() => createWork(title, company, location, salary)} className="mt-4 bg-black text-white px-4 py-2 rounded-lg">
          Добавить
        </button>
      </div>

      <div className="space-y-4">
        {works.map((work) => (
          <div key={work.id} className="bg-white p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold">{work.title}</h3>
            <p className="text-gray-500">{work.company}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> {work.location}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Полная занятость</span>
            </div>
            <p className="mt-2 font-bold text-green-600">{work.salary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};