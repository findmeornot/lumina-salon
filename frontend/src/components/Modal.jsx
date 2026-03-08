import { useEffect } from 'react';

const Modal = ({ open, title, children, onClose, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-white dark:bg-[#1E1E2F] rounded-t-2xl sm:rounded-lg border border-gray-100 dark:border-white/10 shadow-xl animate-[modalIn_.3s_ease-out]">
        <div className="p-4 border-b border-gray-100 dark:border-white/10">
          <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 border-t border-gray-100 dark:border-white/10">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

