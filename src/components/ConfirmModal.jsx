import React, { useEffect, useState } from 'react';

export default function ConfirmModal({
  open,
  title = 'Confirmar',
  message = 'Tem certeza?',
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  hideCancel = false,
  tone = 'orange', // 'orange' | 'blue'
}) {
  const [show, setShow] = useState(open);
  useEffect(() => {
    if (open) setShow(true);
    else {
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!show) return null;

  const accent = tone === 'blue' ? 'blue' : 'orange';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onCancel}
      />
      <div
        className={`bg-white rounded-xl shadow-xl z-10 w-11/12 max-w-md p-6 border-t-8 border-${accent}-500 transform transition-all duration-200 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        <h3 className={`text-lg font-bold mb-2 text-${accent}-700`}>{title}</h3>
        <p className="text-sm text-gray-700 mb-5 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3">
          {!hideCancel && (
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-md bg-${accent}-600 text-white font-semibold hover:bg-${accent}-700 transition`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
