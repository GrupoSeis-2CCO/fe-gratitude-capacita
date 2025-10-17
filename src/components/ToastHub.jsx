import React, { useEffect, useRef, useState } from 'react';

// Usage: window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success'|'error'|'info'|'warning', title, message, duration } }))
export default function ToastHub() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  useEffect(() => {
    function onToast(e) {
      const { type = 'info', title = '', message = '', duration = 3500 } = e.detail || {};
      const id = idRef.current++;
      setToasts((list) => [...list, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((list) => list.filter((t) => t.id !== id));
      }, Math.max(1500, duration));
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  const getColors = (type) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-600', border: 'border-green-500' };
      case 'error': return { bg: 'bg-red-600', border: 'border-red-500' };
      case 'warning': return { bg: 'bg-orange-600', border: 'border-orange-500' };
      default: return { bg: 'bg-blue-600', border: 'border-blue-500' };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3 items-end">
      {toasts.map((t) => {
        const c = getColors(t.type);
        return (
          <div key={t.id}
               className={`min-w-64 max-w-sm text-white shadow-lg rounded-md border ${c.border} ${c.bg} px-4 py-3 transform transition-all duration-300 animate-[fade-in_0.2s_ease-out]`}
               style={{ animationFillMode: 'both' }}>
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            {t.message && <div className="text-sm opacity-95 whitespace-pre-line">{t.message}</div>}
          </div>
        );
      })}
    </div>
  );
}
