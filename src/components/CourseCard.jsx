import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import SmartImage from './SmartImage.jsx';

export default function CourseCard({ course, onClick, onEdit, onDelete, onToggleHidden }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const imageSrc = course.imageUrl || '/default-course-icon.svg';
  const isHidden = Boolean(course.ocultado);

  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
        <div className="relative">
          <button
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
            tabIndex={0}
            aria-label="Ações do curso"
          >
            <MoreHorizontal size={24} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setMenuOpen(false); onEdit && onEdit(course); }}
              >Editar</button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setMenuOpen(false); onDelete && onDelete(course); }}
              >Excluir</button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setMenuOpen(false); onToggleHidden && onToggleHidden(course); }}
              >{course.ocultado ? 'Tornar visível' : 'Ocultar'}</button>
            </div>
          )}
        </div>
      </div>
      <div
        onClick={() => onClick && onClick(course)}
        className={`bg-white border border-gray-200 rounded-lg shadow-md p-4 flex gap-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
        style={isHidden ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' } : undefined}
      >
        <SmartImage
          src={imageSrc}
          alt={`Imagem do ${course.title}`}
          className="w-48 h-32 object-cover rounded-lg bg-gray-100"
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
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow"
            onClick={(e) => { e.stopPropagation(); onToggleHidden && onToggleHidden(course); }}
          >Tornar visível</button>
        </div>
      )}
    </div>
  );
}
