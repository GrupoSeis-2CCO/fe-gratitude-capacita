import React, { useState, useEffect } from 'react';

export default function PromptModal({
  open,
  title = 'Inserir valor',
  label = 'Valor',
  placeholder = '',
  initialValue = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue || '');
  useEffect(() => {
    if (open) setValue(initialValue || '');
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onCancel} />
      <div className={`bg-white rounded-xl shadow-xl z-10 w-11/12 max-w-md p-6 border-t-8 border-blue-500 transform transition-all duration-200 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} style={{ transitionProperty: 'opacity, transform' }}>
        <h3 className="text-lg font-bold mb-4 text-blue-700">{title}</h3>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={() => onConfirm && onConfirm(value)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
