import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';
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
    <div className="h-full flex p-8 gap-4">
      {/* Список контактов */}
      <div className="w-80 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg mb-3">Сообщения</h2>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input placeholder="Поиск людей..." className="bg-transparent outline-none flex-1 text-sm" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {[
            { name: 'Мария Иванова', msg: 'Привет! Как дела?', time: '12:42', active: true },
            { name: 'Дмитрий Смирнов', msg: 'Видел новый дизайн?', time: '11:02', active: false },
            { name: 'Ольга Петрова', msg: 'Скинь отчет, плиз', time: 'Вчера', active: false },
            { name: 'Иван Кузнецов', msg: 'Го в кино', time: 'Вчера', active: false },
          ].map((chat) => (
            <button 
              key={chat.name}
              onClick={() => setSelectedChat(chat.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition ${selectedChat === chat.name ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden relative">
                <img src={`https://i.pravatar.cc/100?u=${chat.name}`} className="w-full h-full object-cover" />
                {chat.active && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-sm ${selectedChat === chat.name ? 'text-white' : 'text-black'}`}>{chat.name}</p>
                <p className={`text-xs truncate ${selectedChat === chat.name ? 'text-gray-300' : 'text-gray-500'}`}>{chat.msg}</p>
              </div>
              <div className={`text-xs ${selectedChat === chat.name ? 'text-gray-300' : 'text-gray-400'}`}>{chat.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
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
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Video size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical size={18} /></button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400">
              Нет сообщений. Напишите первым!
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.username === currentUser?.username ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.username === currentUser?.username 
                  ? 'bg-logline-dark text-white rounded-br-sm' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="text-xs font-bold mb-1 opacity-70">{msg.username}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none border border-transparent focus:border-gray-300"
            />
            <button 
              onClick={sendMessage}
              className="bg-logline-dark text-white px-5 rounded-xl hover:bg-gray-800 flex items-center gap-2"
            >
              <Send size={18} />
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};