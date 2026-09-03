import { useEffect, useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { useStore } from '../store/useStore';

export const HomePage = () => {
  const { token, currentUser, posts, fetchPosts, createPost, likePost } = useStore();
  const [content, setContent] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Главная</h1>
      <div className="bg-white p-4 rounded-2xl mb-6 border border-gray-100">
        <div className="flex gap-3">
          <img src={currentUser?.avatar} className="w-10 h-10 rounded-full" />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Что у вас нового?"
            className="flex-1 resize-none outline-none p-2"
          />
        </div>
        <button onClick={() => createPost(content)} className="ml-auto mt-2 bg-black text-white px-4 py-2 rounded-xl flex gap-2">
          <Send size={16} /> Опубликовать
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={post.avatar} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold">{post.username}</p>
                <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
            <p>{post.content}</p>
            <button onClick={() => likePost(post.id)} className="mt-4 flex items-center gap-2 text-gray-500 hover:text-red-500">
              <Heart size={18} /> {post.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};