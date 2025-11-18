import React from 'react';
import { userService } from '../services/UserService';
import { MoreHorizontal } from 'lucide-react';
import SmartImage from './SmartImage.jsx';

export default function CourseCard({ course, onClick, onEdit, onDelete, onToggleHidden, index = 0 }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const imageSrc = course.imageUrl || '/default-course-icon.svg';
  const isHidden = Boolean(course.ocultado);
  // Só permite ações se não for colaborador (userType !== 2)
  const userType = userService?.getCurrentUserType?.() ?? null;
  const canManage = (userType === 1) && Boolean(onEdit || onDelete || onToggleHidden);

  // Normalize hours display to "Xh" format with fallbacks
  const rawHours = (course && course.stats && course.stats.hours) ?? course?.duracaoEstimada ?? null;
  const formattedHours = React.useMemo(() => {
    if (rawHours == null) return null;
    if (typeof rawHours === 'number') return `${rawHours}h`;
    if (typeof rawHours === 'string') {
      const match = rawHours.match(/^\s*(\d+)/);
      if (match) return `${parseInt(match[1], 10)}h`;
      return rawHours.endsWith('h') ? rawHours : `${rawHours}h`;
    }
    return null;
  }, [rawHours]);

  // alternate card backgrounds for subtle contrast
  const bgClass = index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white';

  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          {formattedHours && (
            <span
              title="Carga horária"
              className="rounded-full px-3 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: '#1F6FEB' }}
            >
              {formattedHours} de curso
            </span>
          )}
        </div>
        {canManage && (
          <div className="relative z-20">
            <button
              className="text-gray-500 hover:text-gray-800 p-1 rounded-full focus:outline-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              tabIndex={0}
              aria-label="Ações do curso"
            >
              <MoreHorizontal size={24} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setMenuOpen(false); onEdit && onEdit(course); }}
                >Editar</button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setMenuOpen(false); onDelete && onDelete(course); }}
                >Excluir</button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setMenuOpen(false); onToggleHidden && onToggleHidden(course); }}
                >{course.ocultado ? 'Tornar visível' : 'Ocultar'}</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        onClick={() => onClick && onClick(course)}
        className={`${bgClass} border border-gray-200 rounded-lg shadow-lg p-4 flex gap-6 transition transform hover:-translate-y-1 hover:shadow-2xl ${onClick ? 'cursor-pointer' : ''}`}
        style={isHidden ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' } : undefined}
      >
        <SmartImage
          src={imageSrc}
          alt={`Imagem do ${course.title}`}
          className="w-48 h-32 object-cover rounded-lg bg-gray-100"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-700">Conteúdo:</h3>
          <p className="text-gray-600 text-sm mt-1">
            {course.description}
          </p>
        </div>
        <div className="border-l border-gray-200 pl-6 w-64">
            <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm text-gray-500">Materiais</div>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
                  {String(course.stats.materials).padStart(2, '0')}
                </span>
                <span className="ml-3 text-sm text-gray-600">arquivos</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Alunos</div>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                  {String(course.stats.students).padStart(2, '0')}
                </span>
                <span className="ml-3 text-sm text-gray-600">inscritos</span>
              </div>
            </div>

            {/* Badges row: shows contextual badges aligned under the counts */}
            <div className="mt-3 flex items-center gap-2">
              {course?.stats?.hasEvaluation && (
                <span title="Possui avaliação" className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
                  Avaliação
                </span>
              )}
              {/* future badges can be added here and will align with this row */}
            </div>
          </div>
        </div>
      </div>
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onToggleHidden && onToggleHidden(course); }}
          >Tornar visível</button>
        </div>
      )}
    </div>
  );
}
