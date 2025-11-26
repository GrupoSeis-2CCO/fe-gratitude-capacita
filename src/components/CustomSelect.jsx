import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Selecione',
  disabled = false,
  label = '',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Encontra o label da opção selecionada
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {label && <label className="mr-2 font-medium text-gray-700">{label}</label>}
      
      {/* Botão do select */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          border rounded px-3 py-1 min-w-[120px] text-left
          flex items-center justify-between gap-2
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white cursor-pointer hover:border-gray-400'
          }
        `}
      >
        <span className={!selectedOption ? 'text-gray-400' : ''}>
          {displayText}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown de opções */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full min-w-[120px] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">Nenhuma opção</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  px-3 py-2 cursor-pointer transition-colors
                  ${option.value === value 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
