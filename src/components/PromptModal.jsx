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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onConfirm && onConfirm(value)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
