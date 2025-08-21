
export function UserPage() {
  // Dados de exemplo para o gráfico
  const chartData = [
    { date: '06/04/2025', value: 4 },
    { date: '07/04/2025', value: 6 },
    { date: '08/04/2025', value: 3 },
    { date: '09/04/2025', value: 7 },
    { date: '10/04/2025', value: 5 },
    { date: '11/04/2025', value: 4 },
    { date: '12/04/2025', value: 9 },
    { date: '13/04/2025', value: 14 },
    { date: '14/04/2025', value: 8 },
    { date: '15/04/2025', value: 6 },
    { date: '16/04/2025', value: 5 },
    { date: '17/04/2025', value: 8 },
    { date: '18/04/2025', value: 7 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const average = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-[200px] p-8">
      {/* Título Principal */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Colaborador y</h1>
      </div>

      {/* Card com informações principais */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <div className="text-gray-700"><strong className="text-gray-900">Email:</strong> alunox@email.com</div>
          <div className="text-gray-700"><strong className="text-gray-900">Primeiro acesso:</strong> 05 de abril de 2025, 14h32</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último acesso:</strong> 23 de abril de 2025, 16h17</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último curso acessado:</strong> Curso x - 07 de abril de 2025, 13h01</div>
        </div>
      </div>

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Coluna Esquerda - Ações */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre o Participante</h2>
          
          <div className="space-y-4">
            <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <span className="text-2xl">📄</span>
              <span className="text-gray-700 font-medium">Provas Realizadas</span>
            </button>

            <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <span className="text-2xl">📚</span>
              <span className="text-gray-700 font-medium">Cursos do Participante</span>
            </button>

            <button className="w-full bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <span className="text-2xl">🗑️</span>
              <span className="text-red-700 font-medium">Apagar Usuário</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita - Gráfico */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Engajamento Diário do Participante</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Label do eixo Y */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90">
              <span className="text-sm font-medium text-gray-600">
                Materiais Completos
              </span>
            </div>

            {/* Container do Gráfico */}
            <div className="relative">
              <svg className="w-full h-96" viewBox="0 0 2000 700" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines horizontais */}
                {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((value) => (
                  <g key={value}>
                    <line
                      x1="100"
                      y1={650 - (value * 40)}
                      x2="1900"
                      y2={650 - (value * 40)}
                      stroke={value === Math.round(average) ? "#FF6B35" : "#e5e7eb"}
                      strokeWidth={value === Math.round(average) ? "2" : "1"}
                      strokeDasharray={value === Math.round(average) ? "5,5" : "none"}
                    />
                    <text
                      x="85"
                      y={660 - (value * 40)}
                      className="fill-gray-500 text-xs"
                      textAnchor="end"
                    >
                      {value}
                    </text>
                    {value === Math.round(average) && (
                      <text
                        x="1000"
                        y={630 - (value * 40)}
                        className="fill-orange-500 text-sm font-medium"
                        textAnchor="middle"
                      >
                        Média Geral
                      </text>
                    )}
                  </g>
                ))}

                {/* Linha do gráfico */}
                <polyline
                  fill="none"
                  stroke="#FF6B35"
                  strokeWidth="8"
                  points={chartData
                    .map((d, i) => `${150 + (i * 135)},${650 - (d.value * 40)}`)
                    .join(' ')}
                  className="drop-shadow-sm"
                />

                {/* Pontos do gráfico */}
                {chartData.map((d, i) => (
                  <circle
                    key={i}
                    cx={150 + (i * 135)}
                    cy={650 - (d.value * 40)}
                    r="12"
                    fill="#FF6B35"
                    className="drop-shadow-sm hover:r-16 transition-all cursor-pointer"
                  />
                ))}
              </svg>
            </div>

            {/* Labels do eixo X */}
            <div className="flex justify-between mt-4 px-4">
              {chartData.map((d, i) => (
                <span key={i} className="text-xs text-gray-500 transform -rotate-45 origin-left">
                  {d.date.split('/').slice(0, 2).join('/')}
                </span>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center mt-6 gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Primeiro Acesso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
