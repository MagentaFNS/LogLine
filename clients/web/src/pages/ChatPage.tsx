import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { Avatar } from '../components/Avatar';

export const ChatPage = () => {
  const { currentUser, token } = useStore();
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserList(res.data);
    };
    fetchUsers();

    // Подключение zum Socket
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    // Empfange Nachricht
    newSocket.on('message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => newSocket.close();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (id: number) => {
    const res = await axios.get(`http://localhost:8080/api/chat/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessages(res.data);
  };

  const openChat = async (user: any) => {
    setSelectedUser(user);
    await fetchMessages(user.id);
  };

  const sendMessage = () => {
    if (text.trim() && socket) {
      socket.emit('message', {
        user_id: currentUser?.id,
        username: currentUser?.username,
        text: text.trim()
      });
      setText('');
    }
  };

  return (
    <div className="h-full flex p-8">
      <div className="w-[350px] bg-white border border-gray-100 rounded-2xl mr-4 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">Чаты</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
            <input placeholder="Поиск по чатам и участникам" className="bg-transparent outline-none flex-1 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {userList.map((user) => (
            <button
              key={user.id}
              onClick={() => openChat(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition ${
                selectedUser?.id === user.id ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                <Avatar uri={user.avatar} username={user.username} size={40} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{user.username}</p>
                <p className="text-xs">в сети</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-100 rounded-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <Avatar uri={selectedUser?.avatar} username={selectedUser?.username} size={40} />
            </div>
            <div>
              <h3 className="font-bold">{selectedUser?.username || 'Чат'}</h3>
              <p className="text-xs text-green-500">в сети</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400">
              Нет сообщений. Напишите первым!
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.username === currentUser?.username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.username === currentUser?.username ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="text-xs font-bold mb-1 opacity-70">{msg.username}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex gap-3 items-center">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none"
          />
          <button onClick={sendMessage} className="bg-black text-white p-3 rounded-xl"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};