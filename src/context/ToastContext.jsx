import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, d) => showToast(msg, 'success', d),
    error: (msg, d) => showToast(msg, 'error', d),
    info: (msg, d) => showToast(msg, 'info', d),
    warning: (msg, d) => showToast(msg, 'warning', d),
  };

  const config = {
    success: { icon: CheckCircle2, ring: 'ring-brand-200', bar: 'bg-brand-500', color: 'text-brand-600', darkColor: 'dark:text-brand-300' },
    error: { icon: XCircle, ring: 'ring-red-200', bar: 'bg-red-500', color: 'text-red-600', darkColor: 'dark:text-red-400' },
    info: { icon: Info, ring: 'ring-blue-200', bar: 'bg-blue-500', color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
    warning: { icon: AlertTriangle, ring: 'ring-amber-200', bar: 'bg-amber-500', color: 'text-amber-600', darkColor: 'dark:text-amber-400' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => {
          const c = config[t.type] || config.info;
          const Icon = c.icon;
          return (
            <div
              key={t.id}
              className="animate-slide-down flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-lg ring-1 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${c.color} ${c.darkColor}`}>
                <Icon size={20} />
              </div>
              <p className="flex-1 pt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
