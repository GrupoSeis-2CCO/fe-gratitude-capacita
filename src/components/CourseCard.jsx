import React from 'react';
import { userService } from '../services/UserService';
import { MoreHorizontal } from 'lucide-react';
import SmartImage from './SmartImage.jsx';

export default function CourseCard({ course, onClick, onEdit, onDelete, onToggleHidden, index = 0 }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const imageSrc = course.imageUrl || '/default-course-icon.svg';
  const isHidden = Boolean(course.ocultado);
  const userType = userService?.getCurrentUserType?.() ?? null;
  const canManage = (userType === 1) && Boolean(onEdit || onDelete || onToggleHidden);

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

  const bgClass = 'bg-slate-100';

  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-start gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-2xl font-bold text-gray-900 leading-tight">{course.title}</h2>
          {formattedHours && (
            <span
              title="Carga horaria"
              className="rounded-full px-3 py-1 text-sm sm:text-sm font-semibold text-white leading-none"
              style={{ backgroundColor: '#1F6FEB' }}
            >
              {formattedHours} de curso
            </span>
          )}
        </div>
        {canManage && (
          <div className="relative z-20 ml-auto">
            <button
              className="text-gray-500 hover:text-gray-800 p-1 rounded-full focus:outline-none cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              tabIndex={0}
              aria-label="Acoes do curso"
            >
              <MoreHorizontal size={24} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
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
                >{course.ocultado ? 'Tornar visivel' : 'Ocultar'}</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        onClick={() => onClick && onClick(course)}
        className={`${bgClass} border border-slate-300 rounded-lg shadow-md p-4 flex flex-col lg:flex-row gap-4 transition transform hover:-translate-y-1 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
        style={isHidden ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' } : undefined}
      >
        <div className="w-full lg:w-48">
          <SmartImage
            src={imageSrc}
            alt={`Imagem do ${course.title}`}
            className="w-full h-44 lg:h-32 object-cover rounded-lg bg-zinc-200"
          />
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 text-lg sm:text-lg">Conteudo:</h3>
          <p className="text-gray-800 text-base sm:text-base mt-1 leading-relaxed">
            {course.description}
          </p>
        </div>
        <div className="w-full lg:w-64 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="col-span-2 flex items-center justify-between">
              <div className="text-base text-gray-600">Materiais</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-base font-semibold border border-green-100 min-w-[52px] justify-center">
                  {String(course.stats.materials).padStart(2, '0')}
                </span>
                <span className="text-base text-gray-800">arquivos</span>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between">
              <div className="text-base text-gray-600">Alunos</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-base font-semibold border border-blue-100 min-w-[52px] justify-center">
                  {String(course.stats.students).padStart(2, '0')}
                </span>
                <span className="text-base text-gray-800">inscritos</span>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2 mt-1">
              {course?.stats?.hasEvaluation && (
                <span title="Possui avaliacao" className="inline-flex items-center px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
                  Avaliacao
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onToggleHidden && onToggleHidden(course); }}
          >Tornar visivel</button>
        </div>
      )}
    </div>
  );
}
