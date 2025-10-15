import React from 'react';

export default function ConfirmModal({ open, title = 'Confirmar', message = 'Tem certeza?', onCancel, onConfirm, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
