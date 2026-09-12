import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Toasts = () => {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast: any) => {
        const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info;
        const colorClass =
          toast.type === 'success' ? 'text-green-500' : toast.type === 'error' ? 'text-red-500' : 'text-blue-500';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3 min-w-[280px] max-w-md animate-slideInRight"
          >
            <Icon size={20} className={colorClass} />
            <p className="flex-1 text-sm font-medium">{toast.text}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
