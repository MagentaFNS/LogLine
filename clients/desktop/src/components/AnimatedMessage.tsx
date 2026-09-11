import { Message } from '../types';

interface Props {
  msg: Message;
  isMine: boolean;
  formatTime: (iso: string) => string;
}

export const AnimatedMessage = ({ msg, isMine, formatTime }: Props) => {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-messageIn`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 transition-all duration-200 hover:shadow-md ${
          isMine
            ? 'bg-black text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-400' : 'text-gray-500'} text-right`}>
          {formatTime(msg.created_at)}
          {isMine && <span className="ml-1">✓✓</span>}
        </p>
      </div>
    </div>
  );
};
