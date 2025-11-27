import React from "react";

import { useEffect, useState } from "react";

export default function Modal({ open, title, message, type = "info", onClose, actions = null }) {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!show) return null;
  let color = "blue";
  if (type === "success") color = "green";
  if (type === "error") color = "red";
  if (type === "warning") color = "orange";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} backdrop-blur-sm bg-black/20`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border-t-8 border-${color}-500
        transform transition-all duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {title && <h2 className={`text-5xl sm:text-xl font-bold mb-4 text-${color}-700 text-center sm:text-left`}>{title}</h2>}
        <div className="mb-5 text-gray-800 whitespace-pre-line text-center sm:text-left text-2xl sm:text-base">{message}</div>
        <div className="flex justify-center sm:justify-end gap-2">
          {actions ? actions : (
            <button
              className={`w-full sm:w-auto px-4 py-2 rounded bg-${color}-600 text-white font-semibold hover:bg-${color}-700 transition`}
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
