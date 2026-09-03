import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Mic } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ChatMessage } from '../types';

export const ChatPage = () => {
  const { currentUser, token } = useStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [selectedChat, setSelectedChat] = useState('Мария Иванова');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8080', {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      {/* Список контактов */}
      <div className="w-[350px] bg-white border border-gray-100 rounded-2xl mr-4 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">Чаты</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
            <Search size={16} className="text-gray-400" />
            <input placeholder="Поиск по чатам и участникам" className="bg-transparent outline-none flex-1 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {[
            { name: 'Мария Иванова', time: '11:42', active: true },
            { name: 'Дмитрий Смирнов', time: '11:15', active: false },
            { name: 'Рабочий чат', time: '10:15', active: false },
            { name: 'Ольга Петрова', time: 'Вчера', active: false },
            { name: 'Иван Кузнецов', time: 'Вчера', active: false },
          ].map((chat) => (
            <button
              key={chat.name}
              onClick={() => setSelectedChat(chat.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition ${selectedChat === chat.name ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${chat.name}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{chat.name}</p>
                <p className="text-xs">{chat.active ? 'в сети' : 'не в сети'}</p>
              </div>
              <div className="text-xs text-gray-400">{chat.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src={`https://i.pravatar.cc/100?u=${selectedChat}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold">{selectedChat}</h3>
              <p className="text-xs text-green-500">в сети</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl"><Phone size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-xl"><Video size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-xl"><MoreVertical size={18} /></button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
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
          <button className="p-2 hover:bg-gray-100 rounded-xl"><Paperclip size={20} /></button>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none"
          />
          <button className="p-2 hover:bg-gray-100 rounded-xl"><Mic size={20} /></button>
          <button onClick={sendMessage} className="bg-black text-white p-3 rounded-xl"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};