import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function CourseCard({ course }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
        <button className="text-gray-500 hover:text-gray-800">
          <MoreHorizontal size={24} />
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex gap-6">
        <img 
          src={course.imageUrl} 
          alt={`Imagem do ${course.title}`} 
          className="w-48 h-32 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-700">Conteúdo</h3>
          <p className="text-gray-600 text-sm mt-1">
            {course.description}
          </p>
        </div>
        <div className="border-l border-gray-200 pl-6 w-64">
          <ul className="text-sm text-gray-700 space-y-2">
            <li>Quantidade de Materiais - {String(course.stats.materials).padStart(2, '0')}</li>
            <li>Quantidade de Alunos - {String(course.stats.students).padStart(2, '0')}</li>
            <li>Total de Horas - {course.stats.hours}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
