import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  addToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const value = {
    toast: addToast,
    addToast,
    success: (msg: string, title?: string) => addToast(msg, 'success', title),
    error: (msg: string, title?: string) => addToast(msg, 'error', title),
    warning: (msg: string, title?: string) => addToast(msg, 'warning', title),
    info: (msg: string, title?: string) => addToast(msg, 'info', title)
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={20} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--warning)" />;
      default:
        return <Info size={20} color="var(--info)" />;
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {
          toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {getIcon(t.type)}
              <div style={{ flex: 1 }}>
                {t.title && <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{t.title}</div>}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{t.message}</div>
              </div>
              <button onClick={() => removeToast(t.id)} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          ))
        }
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
