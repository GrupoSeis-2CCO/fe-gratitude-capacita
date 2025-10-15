import React from 'react';

export default function YearFilter({ value, onChange, className = '', yearsBack = 6 }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [];
  for (let i = 0; i < yearsBack; i++) {
    years.push(currentYear - i);
  }

  return (
    <div className={className}>
      <label className="mr-2 font-medium text-gray-700">Ano:</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="border rounded px-2 py-1"
        aria-label="Filtrar por ano"
      >
        <option value="">Todos os anos</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
