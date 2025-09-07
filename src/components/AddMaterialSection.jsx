import React, { useState } from 'react';
import Button from './Button';

export default function AddMaterialSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [materialType, setMaterialType] = useState('pdf'); // 'pdf' or 'video'

  if (!isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-center items-center mb-8">
        <Button 
          variant="Default" 
          label="Adicionar Material" 
          onClick={() => setIsEditing(true)} 
        />
      </div>
    );
  }

  return (
    <div className="bg-[#1D262D] rounded-lg p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Adicionar Título"
          className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
        />
        <Button variant="Confirm" label="Concluir" onClick={() => setIsEditing(false)} />
        <Button variant="Exit" label="Excluir" onClick={() => setIsEditing(false)} />
      </div>

      <div className="bg-white rounded-lg p-6">
        {materialType === 'pdf' ? (
          <div className="border border-dashed border-gray-400 rounded-lg h-24 flex flex-col items-center justify-center mb-4 text-center">
            <p className="text-gray-600 text-sm">Arraste e solte o arquivo PDF aqui</p>
            <p className="text-xs text-gray-500">ou</p>
            <button className="text-gray-600 border border-gray-400 rounded-md px-3 py-1 text-xs mt-1">
              Selecione o Arquivo
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cole a URL do vídeo aqui..."
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
            />
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Arquivo</span>
              <button 
                className={`px-3 py-1 text-xs rounded border ${materialType === 'pdf' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                onClick={() => setMaterialType('pdf')}
              >
                PDF
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Vídeo</span>
              <button 
                className={`px-3 py-1 text-xs rounded border ${materialType === 'video' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                onClick={() => setMaterialType('video')}
              >
                URL
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Sobre o {materialType === 'video' ? 'vídeo' : 'arquivo'}:</label>
            <textarea
              placeholder="Adicionar Descrição..."
              className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
