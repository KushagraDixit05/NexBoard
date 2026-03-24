'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id:       string;
  message:  string;
  type:     'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const icons = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-danger-50 border-danger-200 text-danger-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div key={toast.id}
                 className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg
                             max-w-sm pointer-events-auto animate-in slide-in-from-right
                             ${styles[toast.type]}`}>
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
