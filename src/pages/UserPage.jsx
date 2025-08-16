import '../styles/UserPage.css';

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
    <div className="participant-page">
      {/* Título Principal */}
      <div className="participant-title">
        <h1>Colaborador y</h1>
      </div>

      {/* Card com informações principais */}
      <div className="info-card-main">
        <div className="info-item">
          <div><strong>Email:</strong> alunox@email.com</div>
          <div><strong>Primeiro acesso:</strong> 05 de abril de 2025, 14h32</div>
          <div><strong>Último acesso:</strong> 23 de abril de 2025, 16h17</div>
          <div><strong>Último curso acessado:</strong> Curso x - 07 de abril de 2025, 13h01</div>
        </div>
      </div>

      {/* Layout em duas colunas */}
      <div className="two-column-layout">
        {/* Coluna Esquerda - Ações */}
        <div className="actions-section">
          <h2 className="actions-title">Sobre o Participante</h2>
          
          <button className="action-btn">
            <span className="action-btn-icon">📄</span>
            Provas Realizadas
          </button>

          <button className="action-btn">
            <span className="action-btn-icon">📚</span>
            Cursos do Participante
          </button>

          <button className="action-btn action-btn-delete">
            <span className="action-btn-icon">🗑️</span>
            Apagar Usuário
          </button>
        </div>

        {/* Coluna Direita - Gráfico */}
        <div className="chart-section">
          <h2 className="chart-title">Engajamento Diário do Participante</h2>
          
          {/* Label do eixo Y */}
          <div className="chart-y-label">
            <span className="chart-y-label-text">
              Materiais<br/>
              Completos
            </span>
          </div>

          {/* Container do Gráfico */}
          <div className="chart-container">
            <svg className="chart-svg" viewBox="0 0 2000 700" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines horizontais */}
              {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((value) => (
                <g key={value}>
                  <line
                    x1="100"
                    y1={650 - (value * 40)}
                    x2="1900"
                    y2={650 - (value * 40)}
                    className={value === Math.round(average) ? "chart-grid-line-dashed" : "chart-grid-line"}
                  />
                  <text
                    x="85"
                    y={660 - (value * 40)}
                    className="chart-y-text"
                  >
                    {value}
                  </text>
                  {value === Math.round(average) && (
                    <text
                      x="1000"
                      y={630 - (value * 40)}
                      className="chart-media-text"
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
                className="chart-line"
              />

              {/* Pontos do gráfico */}
              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={150 + (i * 135)}
                  cy={650 - (d.value * 40)}
                  r="12"
                  fill="#FF6B35"
                  className="chart-point"
                />
              ))}
            </svg>
          </div>

          {/* Labels do eixo X */}
          <div className="chart-x-labels">
            {chartData.map((d, i) => (
              <span key={i} style={{ fontSize: i % 2 === 0 ? '4rem' : '3.5rem' }}>
                {d.date.split('/').slice(0, 2).join('/')}
              </span>
            ))}
          </div>

          {/* Legenda */}
          <div className="chart-legend">
            <div className="chart-legend-color"></div>
            <span>Primeiro Acesso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
