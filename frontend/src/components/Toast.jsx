import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const styles = {
  success: 'bg-teal-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-gray-900 text-white'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random()}`;
    const t = { id, type: 'info', duration: 3000, ...toast };
    setToasts((p) => [...p, t]);
    window.setTimeout(() => {
      setToasts((p) => p.filter((x) => x.id !== id));
    }, t.duration);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'min-w-[260px] max-w-[360px] rounded-lg px-4 py-3 shadow-lg',
              'animate-[toastIn_.25s_ease-out]',
              styles[t.type] || styles.info
            ].join(' ')}
          >
            {t.title && <div className="font-semibold">{t.title}</div>}
            <div className="text-sm opacity-95">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
};

