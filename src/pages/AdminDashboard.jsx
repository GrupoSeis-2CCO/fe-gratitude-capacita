// import React, { useEffect, useState } from 'react';
// import { api } from '../services/api.js';
// import ApexBarChart from '../components/ApexBarChart.jsx';

// // Página inicial de dashboard administrativo (funcionário)
// function AdminDashboardPage() {
//   const [cursoId, setCursoId] = useState(null);
//   const [cursoValido, setCursoValido] = useState(false);
//   const [validandoCurso, setValidandoCurso] = useState(false);
//   const [listaCursos, setListaCursos] = useState([]);
  
//   // Filtros de Data
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
//   const [selectedWeek, setSelectedWeek] = useState(0); // 0 = Mês inteiro, 1-5 = Semanas

//   const currentYear = new Date().getFullYear();
//   const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
//   const weeksInMonth = Math.ceil(daysInMonth / 7);

//   // Resetar semana se o mês mudar e a semana selecionada não existir no novo mês
//   useEffect(() => {
//     if (selectedWeek > weeksInMonth) {
//       setSelectedWeek(0);
//     }
//   }, [selectedMonth, weeksInMonth, selectedWeek]);

//   const [kpis, setKpis] = useState(null);
//   const [engajamento, setEngajamento] = useState([]);
//   const [feedback, setFeedback] = useState(null);
  
//   const [loading, setLoading] = useState(false);
//   const [erro, setErro] = useState(null);
//   const [showInactiveModal, setShowInactiveModal] = useState(false);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Helper para calcular datas
//   const getDateRange = (year, month, week) => {
//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);

//     if (week === 0) {
//       // Mês inteiro
//       return { 
//         from: firstDayOfMonth.toISOString().split('T')[0], 
//         to: lastDayOfMonth.toISOString().split('T')[0] 
//       };
//     } else {
//       // Semana específica (1-4/5)
//       // Assumindo semanas de 7 dias começando do dia 1
//       const startDay = (week - 1) * 7 + 1;
//       const endDay = Math.min(startDay + 6, lastDayOfMonth.getDate());
      
//       const fromDate = new Date(year, month, startDay);
//       const toDate = new Date(year, month, endDay);
      
//       return {
//         from: fromDate.toISOString().split('T')[0],
//         to: toDate.toISOString().split('T')[0]
//       };
//     }
//   };

//   useEffect(() => {
//     api.get('/cursos')
//       .then(({ data }) => {
//         const mapped = (Array.isArray(data) ? data : []).map(c => ({
//           id: c.id_curso || c.id || c.idCurso || c.idCurso || c.id_curso,
//           nome: c.tituloCurso || c.titulo || c.nome_curso || c.nome || c.nomeCurso || `Curso ${c.id || c.idCurso}`
//         })).filter(c => c.id != null);
//         setListaCursos(mapped);
//       })
//       .catch(() => setListaCursos([]));
//   }, []);

//   useEffect(() => {
//     if (!cursoId) { setCursoValido(false); return; }
//     setValidandoCurso(true);
//     api.get(`/cursos/${cursoId}/detalhes`)
//       .then(() => { setCursoValido(true); setErro(null); })
//       .catch(() => { setCursoValido(false); setErro('Curso inexistente'); })
//       .finally(() => setValidandoCurso(false));
//   }, [cursoId]);

//   useEffect(() => {
//     if (!cursoId || !cursoValido) return;
//     setLoading(true);
    
//     const currentYear = new Date().getFullYear();
//     const { from, to } = getDateRange(currentYear, selectedMonth, selectedWeek);

//     api.get(`/relatorios/curso/${cursoId}/dashboard?from=${from}&to=${to}`)
//       .then(({ data }) => {
//         setKpis(data.kpis || null);
//         setEngajamento(data.engajamento || []);
//         setFeedback(data.feedback || null);
//         setErro(null);
//       })
//       .catch(err => {
//         console.error('Erro ao carregar dashboard:', err);
//         setErro('Erro ao carregar métricas');
//       })
//       .finally(() => setLoading(false));
//   }, [cursoId, cursoValido, selectedMonth, selectedWeek, refreshTrigger]);

//   const months = [
//     "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
//     "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
//   ];

//   return (
//     <div className="flex w-full min-h-screen bg-white overflow-hidden">
//       <div className="flex-1 relative pl-4 md:pl-12 lg:pl-16">
//         <div className="px-4 pt-24 pb-4 max-w-7xl mx-auto h-full overflow-y-auto">
//           {!cursoId ? (
//             <div className="flex flex-col items-center justify-center h-full pb-20 animate-fade-in">
//               <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 mb-8 text-center">Dashboards Cursos</h1>
//               <div className="w-full max-w-md">
//                 <label className="block text-sm font-medium text-zinc-600 mb-2 text-center">Selecione um Curso para começar</label>
//                 <select
//                   className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-lg bg-white shadow-lg cursor-pointer hover:border-zinc-400 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                   value=""
//                   onChange={e => {
//                     const val = e.target.value ? parseInt(e.target.value, 10) : null;
//                     setCursoId(val);
//                   }}
//                 >
//                   <option value="" disabled>Selecione um curso...</option>
//                   {listaCursos.map(c => (
//                     <option key={c.id} value={c.id}>{c.id} - {c.nome}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 mt-2 gap-4">
//                 <h1 className="text-xl md:text-2xl font-semibold">Dashboards Cursos</h1>
//               </div>

//               <div className="mb-6 flex items-start gap-4 flex-wrap">
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-medium text-zinc-600">Curso</label>
//                   <select
//                     className={`border rounded px-3 py-2 min-w-[220px] text-sm cursor-pointer ${cursoId && !cursoValido ? 'border-red-500 bg-red-50' : 'border-zinc-300 bg-zinc-100'}`}
//                     value={cursoId ?? ''}
//                     onChange={e => {
//                       const val = e.target.value ? parseInt(e.target.value, 10) : null;
//                       setCursoId(val);
//                     }}
//                   >
//                     <option value="" disabled>Selecione</option>
//                     {listaCursos.map(c => (
//                       <option key={c.id} value={c.id} className="cursor-pointer">{c.id} - {c.nome}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="text-base text-zinc-600 min-h-[24px] flex items-center">
//                   {validandoCurso ? 'Validando...' : (!cursoId ? 'Selecione um curso.' : !cursoValido ? 'Curso não encontrado.' : null)}
//                 </div>

//                 {cursoId && cursoValido && (
//                   <button 
//                     onClick={() => setRefreshTrigger(prev => prev + 1)}
//                     disabled={loading}
//                     className={`ml-auto px-4 py-2 border border-zinc-300 text-zinc-700 rounded transition-colors text-sm font-medium flex items-center gap-2 shadow-md ${loading ? 'bg-zinc-200 cursor-not-allowed opacity-70' : 'bg-zinc-100 hover:bg-zinc-200 cursor-pointer'}`}
//                     title="Atualizar dados"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
//                       {loading ? (
//                         <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//                       ) : (
//                         <>
//                           <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>
//                         </>
//                       )}
//                     </svg>
//                     {loading ? 'Atualizando...' : 'Atualizar'}
//                   </button>
//                 )}
//               </div>
//             </>
//           )}

//           {erro && <p className="text-base text-red-600 mb-4">{erro}</p>}

//           {kpis && (
//             <>
//               <p className="text-xs text-zinc-500 mb-2 italic text-right">
//                 * Clique nas métricas para ver o número de participantes
//               </p>
//               <section className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-4">
//               <MetricCard 
//                 title="% Colaboradores Ativos (7 dias)" 
//                 value={kpis.ativosSemanaPct.toFixed(1) + '%'} 
//                 secondaryValue={kpis.ativosSemanaCount + ' usuários'}
//               />
//               <MetricCard 
//                 title="% Ativos 3x ou mais (7 dias)" 
//                 value={kpis.ativos3xSemanaPct.toFixed(1) + '%'} 
//                 secondaryValue={kpis.ativos3xSemanaCount + ' usuários'}
//               />
//               <MetricCard 
//                 title="% Concluindo +1 Curso (7 dias)" 
//                 value={kpis.concluindoMais1CursoPct.toFixed(1) + '%'} 
//                 secondaryValue={kpis.concluindoMais1CursoCount + ' usuários'}
//               />
//               <MetricCard 
//                 title="Participantes Inativos (>15 dias)" 
//                 value={kpis.inativosCount} 
//                 textColor="text-red-600"
//                 isClickable={true}
//                 onClick={() => setShowInactiveModal(true)}
//               />
//             </section>
//             </>
//           )}

//           {cursoId && cursoValido && (
//             <div className="bg-zinc-100 rounded-lg shadow-md px-4 py-3 mb-4 border border-zinc-200 relative">
//               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
//                 <h2 className="text-lg font-semibold text-zinc-800">Engajamento Diário</h2>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <select 
//                     className="border border-zinc-300 rounded px-3 py-1.5 text-sm bg-zinc-100 min-w-[150px] cursor-pointer"
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//                   >
//                     {months.map((m, idx) => (
//                       <option key={idx} value={idx} className="cursor-pointer">{m}</option>
//                     ))}
//                   </select>
                  
//                   <select 
//                     className="border border-zinc-300 rounded px-3 py-1.5 text-sm bg-zinc-100 min-w-[180px] cursor-pointer"
//                     value={selectedWeek}
//                     onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
//                   >
//                     <option value={0} className="cursor-pointer">Mês Inteiro</option>
//                     {Array.from({ length: weeksInMonth }, (_, i) => i + 1).map(w => {
//                       const { from, to } = getDateRange(currentYear, selectedMonth, w);
//                       const fromStr = from.split('-').slice(1).reverse().join('/');
//                       const toStr = to.split('-').slice(1).reverse().join('/');
//                       return (
//                         <option key={w} value={w} className="cursor-pointer">Semana {w} ({fromStr} - {toStr})</option>
//                       );
//                     })}
//                   </select>
//                 </div>
//               </div>
//               <div className="h-72">
//                 <ApexBarChart data={engajamento} height={280} />
//               </div>
//               <div className="mt-4 pt-3 border-t border-zinc-200">
//                 <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
//                   <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
//                   </div>
//                   <p className="text-sm font-semibold">
//                     Nota: Engajamento significa que um material foi concluído.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {cursoId && cursoValido && (
//             <footer className="mt-6 flex justify-end">
//               <span className="text-sm font-medium text-zinc-600 bg-zinc-100 px-4 py-2 rounded-full shadow-md border border-zinc-200">
//                 Atualizado: {kpis?.generatedAt ? new Date(kpis.generatedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
//               </span>
//             </footer>
//           )}
//         </div>
//       </div>

//       {showInactiveModal && kpis && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//           <div className="bg-zinc-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-zinc-200">
//             <div className="p-6 border-b border-zinc-300 flex justify-between items-center">
//               <h3 className="font-bold text-2xl text-red-600">Participantes Inativos</h3>
//               <button onClick={() => setShowInactiveModal(false)} className="text-zinc-400 hover:text-zinc-600 p-2">
//                 <span className="text-2xl">×</span>
//               </button>
//             </div>
//             <div className="p-6 overflow-y-auto flex-1">
//               {kpis.inativosLista && kpis.inativosLista.length > 0 ? (
//                 <ul className="divide-y divide-zinc-200">
//                   {kpis.inativosLista.map((u, idx) => (
//                     <li key={idx} className="py-4 flex justify-between items-center">
//                       <div className="flex flex-col gap-1">
//                         <span className="font-semibold text-lg text-zinc-800">{u.nome}</span>
//                         <span className="text-sm text-zinc-500">{u.email}</span>
//                       </div>
//                       <div className="text-right">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                           {u.diasInativo > 10000 ? 'Nunca acessou' : `${u.diasInativo} dias inativo`}
//                         </span>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-zinc-500 text-center py-8 text-lg">Nenhum participante inativo encontrado.</p>
//               )}
//             </div>
//             <div className="p-6 border-t border-zinc-300 bg-zinc-50 rounded-b-xl flex justify-end">
//               <button 
//                 // onClick={() => setShowInactiveModal(false)}
//                 className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-medium text-zinc-700 transition-colors"
//               >
//                 Fechar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function MetricCard({ title, value, secondaryValue, textColor = "text-zinc-800", isClickable = false, onClick }) {
//   const [showSecondary, setShowSecondary] = useState(false);

//   const handleClick = () => {
//     if (secondaryValue) {
//       setShowSecondary(!showSecondary);
//     }
//     if (onClick) {
//       onClick();
//     }
//   };

//   const displayValue = showSecondary ? secondaryValue : value;
//   const cursorClass = (isClickable || secondaryValue) ? 'cursor-pointer hover:bg-zinc-200 transition-colors ring-1 ring-transparent hover:ring-zinc-300' : '';

//   return (
//     <div 
//       className={`bg-zinc-100 rounded-lg shadow-md px-4 py-3 flex flex-col items-center justify-center text-center gap-1 border border-zinc-200 h-full ${cursorClass}`}
//       onClick={handleClick}
//     >
//       <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">{title}</span>
//       <span className={`text-3xl font-bold ${textColor}`}>{displayValue}</span>
//       {isClickable && !secondaryValue && <span className="text-[10px] text-zinc-400 mt-1">Clique para ver detalhes</span>}
//       {secondaryValue && <span className="text-[10px] text-zinc-400 mt-1">Clique para alternar</span>}
//     </div>
//   );
// }

// export default AdminDashboardPage;
