import React from 'react';
import Button from './Button';

export default function AddCourseSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center mb-8">
      <select className="border border-gray-300 rounded-md p-2 text-sm">
        <option>Ordenar por</option>
        <option>Mais Recentes</option>
        <option>Mais Antigos</option>
        <option>Ordem Alfabética</option>
      </select>
      <Button variant="Confirm" label="Adicionar Curso" />
    </div>
  );
}
