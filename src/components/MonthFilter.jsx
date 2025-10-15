import React from 'react';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MonthFilter({ value, onChange, className = '' }) {
  // value: '01'..'12' or null/'' for todos
  return (
    <div className={className}>
      <label className="mr-2 font-medium text-gray-700">Mês:</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="border rounded px-2 py-1"
        aria-label="Filtrar por mês"
      >
        <option value="" disabled>Selecione</option>
        {MONTHS_PT.map((m, idx) => {
          const val = String(idx + 1).padStart(2, '0');
          // capitaliza primeira letra (já capitalizado aqui)
          return (
            <option key={val} value={val}>
              {m}
            </option>
          );
        })}
      </select>
    </div>
  );
}
