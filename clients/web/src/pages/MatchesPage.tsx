import { User } from 'lucide-react';

export const MatchesPage = () => {
  const people = [
    { name: 'Мария', age: 24, bio: 'Люблю кофе и дизайн' },
    { name: 'Дмитрий', age: 27, bio: 'Backend разработчик' },
    { name: 'Ольга', age: 22, bio: 'Маркетолог' },
    { name: 'Иван', age: 25, bio: 'Фотограф' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Знакомства</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {people.map((person, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition duration-300 cursor-pointer">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 overflow-hidden">
              <img src={`https://i.pravatar.cc/150?img=${i+5}`} className="w-full h-full object-cover" />
            </div>
            <p className="font-bold">{person.name}, {person.age}</p>
            <p className="text-gray-500 text-sm">{person.bio}</p>
            <button className="mt-4 bg-black text-white w-full py-2 rounded-xl flex items-center justify-center gap-2">
              <User size={16} /> Добавить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};