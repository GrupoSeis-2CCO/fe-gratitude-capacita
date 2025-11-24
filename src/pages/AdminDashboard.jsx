import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import BackButton from '../components/BackButton.jsx';
import ApexBarChart from '../components/ApexBarChart.jsx';

// Página inicial de dashboard administrativo (funcionário)
export default function AdminDashboardPage() {
  const [cursoId, setCursoId] = useState(null);
  const [cursoValido, setCursoValido] = useState(false);
  const [validandoCurso, setValidandoCurso] = useState(false);
  const [listaCursos, setListaCursos] = useState([]);
  
  // Filtros de Data
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = Mês inteiro, 1-5 = Semanas

  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const weeksInMonth = Math.ceil(daysInMonth / 7);

  // Resetar semana se o mês mudar e a semana selecionada não existir no novo mês
  useEffect(() => {
    if (selectedWeek > weeksInMonth) {
      setSelectedWeek(0);
    }
  }, [selectedMonth, weeksInMonth, selectedWeek]);

  const [kpis, setKpis] = useState(null);
  const [engajamento, setEngajamento] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  // Helper para calcular datas
  const getDateRange = (year, month, week) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    if (week === 0) {
      // Mês inteiro
      return { 
        from: firstDayOfMonth.toISOString().split('T')[0], 
        to: lastDayOfMonth.toISOString().split('T')[0] 
      };
    } else {
      // Semana específica (1-4/5)
      // Assumindo semanas de 7 dias começando do dia 1
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(startDay + 6, lastDayOfMonth.getDate());
      
      const fromDate = new Date(year, month, startDay);
      const toDate = new Date(year, month, endDay);
      
      return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      };
    }
  };

  useEffect(() => {
    api.get('/cursos')
      .then(({ data }) => {
        const mapped = (Array.isArray(data) ? data : []).map(c => ({
          id: c.id_curso || c.id || c.idCurso || c.idCurso || c.id_curso,
          nome: c.tituloCurso || c.titulo || c.nome_curso || c.nome || c.nomeCurso || `Curso ${c.id || c.idCurso}`
        })).filter(c => c.id != null);
        setListaCursos(mapped);
      })
      .catch(() => setListaCursos([]));
  }, []);

  useEffect(() => {
    if (!cursoId) { setCursoValido(false); return; }
    setValidandoCurso(true);
    api.get(`/cursos/${cursoId}/detalhes`)
      .then(() => { setCursoValido(true); setErro(null); })
      .catch(() => { setCursoValido(false); setErro('Curso inexistente'); })
      .finally(() => setValidandoCurso(false));
  }, [cursoId]);

  useEffect(() => {
    if (!cursoId || !cursoValido) return;
    setLoading(true);
    
    const currentYear = new Date().getFullYear();
    const { from, to } = getDateRange(currentYear, selectedMonth, selectedWeek);

    api.get(`/relatorios/curso/${cursoId}/dashboard?from=${from}&to=${to}`)
      .then(({ data }) => {
        setKpis(data.kpis || null);
        setEngajamento(data.engajamento || []);
        setFeedback(data.feedback || null);
        setErro(null);
      })
      .catch(err => {
        console.error('Erro ao carregar dashboard:', err);
        setErro('Erro ao carregar métricas');
      })
      .finally(() => setLoading(false));
  }, [cursoId, cursoValido, selectedMonth, selectedWeek]);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="flex w-full h-screen bg-zinc-50 overflow-hidden">
      <div className="flex-1 relative pl-6 md:pl-12 lg:pl-16">
        <div className="px-4 pt-20 pb-4 max-w-7xl mx-auto h-full overflow-y-auto">
          <BackButton className="" />
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 mt-2 gap-4">
            <h1 className="text-xl md:text-2xl font-semibold">Dashboard Administrativo</h1>
          </div>

          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">Curso</label>
              <select
                className={`border rounded px-3 py-2 min-w-[240px] text-sm ${cursoId && !cursoValido ? 'border-red-500 bg-red-50' : 'border-zinc-300'}`}
                value={cursoId ?? ''}
                onChange={e => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null;
                  setCursoId(val);
                }}
              >
                <option value="" disabled>Selecione</option>
                {listaCursos.map(c => (
                  <option key={c.id} value={c.id}>{c.id} - {c.nome}</option>
                ))}
              </select>
            </div>
            <div className="text-base text-zinc-600 min-h-[24px] flex items-center">
              {validandoCurso ? 'Validando...' : (!cursoId ? 'Selecione um curso.' : cursoValido ? 'Curso válido.' : 'Curso não encontrado.')}
            </div>
          </div>

          {loading && <p className="text-base text-zinc-500 mb-4">Carregando métricas...</p>}
          {erro && <p className="text-base text-red-600 mb-4">{erro}</p>}

          {kpis && cursoValido && !loading && (
            <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <MetricCard title="% Colaboradores Ativos (7 dias)" value={kpis.ativosSemanaPct.toFixed(1) + '%'} />
              <MetricCard title="% Ativos 3x ou mais (7 dias)" value={kpis.ativos3xSemanaPct.toFixed(1) + '%'} />
              <MetricCard title="% Concluindo +1 Curso (7 dias)" value={kpis.concluindoMais1CursoPct.toFixed(1) + '%'} />
              <MetricCard 
                title="Participantes Inativos (>15 dias)" 
                value={kpis.inativosCount} 
                textColor="text-red-600"
                isClickable={true}
                onClick={() => setShowInactiveModal(true)}
              />
            </section>
          )}

          {cursoId && cursoValido && (
            <div className="bg-white rounded-lg shadow px-4 py-4 mb-6 border border-zinc-100 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-zinc-800">Engajamento Diário</h2>
                {/* Filtros de Mês e Semana */}
                <div className="flex gap-3">
                  <select 
                    className="border border-zinc-300 rounded px-3 py-1.5 text-sm bg-white min-w-[120px]"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                  
                  <select 
                    className="border border-zinc-300 rounded px-3 py-1.5 text-sm bg-white min-w-[180px]"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  >
                    <option value={0}>Mês Inteiro</option>
                    {Array.from({ length: weeksInMonth }, (_, i) => i + 1).map(w => {
                      const { from, to } = getDateRange(currentYear, selectedMonth, w);
                      const fromStr = from.split('-').slice(1).reverse().join('/');
                      const toStr = to.split('-').slice(1).reverse().join('/');
                      return (
                        <option key={w} value={w}>Semana {w} ({fromStr} - {toStr})</option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="h-72">
                <ApexBarChart data={engajamento} height={280} />
              </div>
            </div>
          )}

          <footer className="text-xs text-zinc-500 mt-4">Atualizado: {kpis?.generatedAt || new Date().toLocaleString()}</footer>
        </div>
      </div>

      {showInactiveModal && kpis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-2xl text-red-600">Participantes Inativos</h3>
              <button onClick={() => setShowInactiveModal(false)} className="text-zinc-400 hover:text-zinc-600 p-2">
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {kpis.inativosLista && kpis.inativosLista.length > 0 ? (
                <ul className="divide-y divide-zinc-100">
                  {kpis.inativosLista.map((u, idx) => (
                    <li key={idx} className="py-4 flex flex-col gap-1">
                      <span className="font-semibold text-lg text-zinc-800">{u.nome}</span>
                      <span className="text-sm text-zinc-500">{u.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-center py-8 text-lg">Nenhum participante inativo encontrado.</p>
              )}
            </div>
            <div className="p-6 border-t bg-zinc-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setShowInactiveModal(false)}
                className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-medium text-zinc-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, textColor = "text-zinc-800", isClickable = false, onClick }) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm px-6 py-5 flex flex-col gap-2 border border-zinc-100 ${isClickable ? 'cursor-pointer hover:bg-zinc-50 transition-colors ring-1 ring-transparent hover:ring-zinc-200' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      <span className="text-sm uppercase tracking-wide text-zinc-500 font-semibold">{title}</span>
      <span className={`text-4xl font-bold ${textColor}`}>{value}</span>
      {isClickable && <span className="text-xs text-zinc-400 mt-1">Clique para ver detalhes</span>}
    </div>
  );
}
