import { useEffect, useRef, useState } from 'react';
import { Heart, Send, Trash2, Image as ImageIcon, Code, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { Avatar } from '../components/Avatar';

export const HomePage = () => {
  const { token, currentUser, posts, fetchPosts, createPost, likePost, unlikePost } = useStore();
  const [content, setContent] = useState('');
  const [codeBlock, setCodeBlock] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showCodeHint, setShowCodeHint] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { fetchPosts(); }, []);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      const res = await axios.post('http://localhost:8080/api/upload/post-image', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setImagePreview(res.data.image);
    }
  };

  const submitPost = async () => {
    if (content.trim() || codeBlock.trim() || imagePreview) {
      await createPost(content, imagePreview, codeBlock);
      setContent('');
      setCodeBlock('');
      setImagePreview('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '`' && e.ctrlKey) {
      e.preventDefault();
      setShowCodeHint(true);
      setCodeBlock(prev => prev + '```\n');
    }
    if (e.key === 'Escape') {
      setShowCodeHint(false);
    }
  };

  const deletePost = async (id: number) => {
    await axios.delete(`http://localhost:8080/api/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchPosts();
  };

  const like = async (post: any) => {
    const isLiked = likedPosts.has(post.id);
    if (isLiked) {
      await unlikePost(post.id);
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    } else {
      await likePost(post.id);
      setLikedPosts(prev => new Set(prev).add(post.id));
    }
  };

  const CopyCode = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button onClick={copy} className="absolute top-2 right-2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    );
  };

  return (
    <div className="p-8 overflow-y-auto h-full">
      <h1 className="text-3xl font-bold mb-6">Главная</h1>
      
      <div className="bg-white p-6 rounded-2xl mb-6 border border-gray-100 shadow-sm">
        <div className="flex gap-3">
          <Avatar uri={currentUser?.avatar} username={currentUser?.username} size={40} />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Что у вас нового?"
              className="w-full resize-none outline-none p-2 min-h-[60px] text-lg"
            />
            
            {showCodeHint && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2 text-sm text-gray-500">
                Нажми <kbd className="bg-white border px-1 rounded">Ctrl</kbd> + <kbd className="bg-white border px-1 rounded">`</kbd> для вставки блока кода
              </div>
            )}

            {codeBlock && (
              <div className="relative bg-gray-900 text-white rounded-xl p-4 mb-2 overflow-x-auto">
                <button onClick={() => setCodeBlock('')} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
                <pre className="text-sm font-mono whitespace-pre-wrap">{codeBlock}</pre>
              </div>
            )}

            {imagePreview && (
              <div className="relative mb-2">
                <img src={imagePreview} className="max-h-64 rounded-xl object-cover" />
                <button onClick={() => setImagePreview('')} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full">✕</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
              <ImageIcon size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUploadImage} className="hidden" accept="image/*" />
            <button onClick={() => setCodeBlock(prev => prev + '```\n')} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
              <Code size={20} />
            </button>
          </div>
          <button onClick={submitPost} className="bg-black text-white px-4 py-2 rounded-xl flex gap-2">
            <Send size={16} /> Опубликовать
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Avatar uri={post.avatar} username={post.username} size={40} />
              <div>
                <p className="font-bold">{post.username}</p>
                <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('ru-RU')}</p>
              </div>
              {post.username === currentUser?.username && (
                <button onClick={() => deletePost(post.id)} className="ml-auto p-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <p className="mb-4">{post.content}</p>

            {post.image && (
              <img src={post.image} className="rounded-xl mb-4 max-h-96 w-auto" />
            )}

            {post.code && (
              <div className="relative bg-gray-900 text-white rounded-xl p-4 mb-4 overflow-x-auto">
                <CopyCode code={post.code} />
                <pre className="text-sm font-mono whitespace-pre-wrap">{post.code}</pre>
              </div>
            )}

            <button
              onClick={() => like(post)}
              className={`mt-4 flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
                likedPosts.has(post.id)
                  ? 'bg-black text-white scale-110'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Heart size={18} className={likedPosts.has(post.id) ? 'fill-white' : ''} />
              {post.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};