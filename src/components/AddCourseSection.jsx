import React, { useState } from 'react';
import Button from './Button';

export default function AddCourseSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isHidden, setIsHidden] = useState(true);

  if (!isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center mb-8">
        <select className="border border-gray-300 rounded-md p-2 text-sm">
          <option>Ordenar por</option>
          <option>Mais Recentes</option>
          <option>Mais Antigos</option>
          <option>Ordem Alfabética</option>
        </select>
        <Button variant="Confirm" label="Adicionar Curso" onClick={() => { setIsHidden(true); setIsEditing(true); }} />
      </div>
    );
  }

  return (
    <div className="bg-[#1D262D] rounded-lg p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Adicionar nome"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 text-lg"
        />
        {/* Hidden toggle - use shared Button for consistent sizing */}
        <Button
          variant={isHidden ? 'Ghost' : 'Default'}
          label={isHidden ? '🔒 Oculto' : '🔓 Visível'}
          onClick={() => setIsHidden(!isHidden)}
        />

        <Button variant="Confirm" label="Concluir" onClick={() => { console.log('Concluir curso', { title, content, isHidden }); setIsEditing(false); }} />
        <Button variant="Exit" label="Excluir" onClick={() => { setIsEditing(false); setTitle(''); setContent(''); }} />
      </div>

      <div className="bg-white rounded-lg p-6 flex items-start gap-6">
        <div className="w-1/3">
          <div className="rounded-lg border border-gray-200 h-40 flex items-center justify-center bg-gray-50">
            <button className="px-4 py-2 border border-gray-300 rounded text-sm">Adicionar imagem</button>
          </div>
        </div>

        <div className="w-1/3">
          <label className="block text-lg font-semibold mb-2">Conteúdo</label>
          <textarea
            placeholder="Adicionar Conteúdo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        <div className="flex-1">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium">Quantidade de Materiais</div>
            <div className="text-lg font-medium">Quantidade de Alunos</div>
            <div className="text-lg font-medium">Total de Horas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
