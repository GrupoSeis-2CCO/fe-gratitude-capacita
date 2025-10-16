import React from "react";

import { useEffect, useState } from "react";

export default function Modal({ open, title, message, type = "info", onClose, actions = null }) {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) setShow(true);
    else {
      // Aguarda animação de saída antes de remover do DOM
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!show) return null;
  let color = "blue";
  if (type === "success") color = "green";
  if (type === "error") color = "red";
  if (type === "warning") color = "orange";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} backdrop-blur-sm bg-black/20`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg max-w-md w-full p-6 border-t-8 border-${color}-500
        transform transition-all duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {title && <h2 className={`text-xl font-bold mb-2 text-${color}-700`}>{title}</h2>}
        <div className="mb-4 text-gray-800 whitespace-pre-line">{message}</div>
        <div className="flex justify-end gap-2">
          {actions ? actions : (
            <button
              className={`px-4 py-2 rounded bg-${color}-600 text-white font-semibold hover:bg-${color}-700 transition`}
              onClick={onClose}
              autoFocus
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
