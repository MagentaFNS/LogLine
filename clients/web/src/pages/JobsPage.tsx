import { Briefcase, MapPin, Clock, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const JobsPage = () => {
  const { token, works, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  useEffect(() => {
    setIsAdmin(currentUser?.role === 'admin');
  }, [currentUser]);

  // Загрузка данных
  const fetchWorks = async () => {
    const res = await axios.get('http://localhost:8080/api/works', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Обновляем через store (если есть) или локально
    useStore.setState({ works: res.data });
  };

  useEffect(() => { fetchWorks(); }, [token]);

  const handleCreate = async () => {
    await axios.post('http://localhost:8080/api/works', { title, company, location, salary }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTitle(''); setCompany(''); setLocation(''); setSalary('');
    await fetchWorks();
  };

  const handleEdit = async () => {
    await axios.put(`http://localhost:8080/api/works/${editingWork.id}`, { title, company, location, salary }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShowModal(false);
    setEditingWork(null);
    setTitle(''); setCompany(''); setLocation(''); setSalary('');
    await fetchWorks();
  };

  const handleDelete = async () => {
    await axios.delete(`http://localhost:8080/api/works/${editingWork.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShowModal(false);
    setEditingWork(null);
    await fetchWorks();
  };

  const openEdit = (work: any) => {
    setEditingWork(work);
    setTitle(work.title);
    setCompany(work.company);
    setLocation(work.location);
    setSalary(work.salary);
    setShowModal(true);
  };

  const filteredWorks = works.filter(w => w.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Работы</h1>
        {isAdmin && (
          <div className="flex gap-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по работам..."
              className="border border-gray-200 p-2 rounded-lg w-64"
            />
            <button onClick={() => { setEditingWork(null); setTitle(''); setCompany(''); setLocation(''); setSalary(''); setShowModal(true); }} className="bg-black text-white px-4 py-2 rounded-lg">
              Добавить вакансию
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredWorks.map((work) => (
          <div key={work.id} className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-bold">{work.title}</h3>
                <p className="text-gray-500">{work.company}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {work.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> Полная занятость</span>
                </div>
                <p className="mt-2 font-bold text-green-600">{work.salary}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(work)} className="bg-black text-white p-2 rounded-lg hover:bg-gray-800">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => { setEditingWork(work); setShowModal(true); }} className="bg-black text-white p-2 rounded-lg hover:bg-gray-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingWork ? 'Редактировать' : 'Добавить'} вакансию</h2>
            <div className="space-y-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="border border-gray-200 p-2 rounded-lg w-full" />
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Компания" className="border border-gray-200 p-2 rounded-lg w-full" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Место" className="border border-gray-200 p-2 rounded-lg w-full" />
              <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="Зарплата" className="border border-gray-200 p-2 rounded-lg w-full" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black px-4 py-2">Отмена</button>
              {editingWork ? (
                <>
                  <button onClick={handleDelete} className="bg-black text-white px-4 py-2 rounded-lg">Удалить</button>
                  <button onClick={handleEdit} className="bg-black text-white px-4 py-2 rounded-lg">Редактировать</button>
                </>
              ) : (
                <button onClick={handleCreate} className="bg-black text-white px-4 py-2 rounded-lg">Добавить</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};