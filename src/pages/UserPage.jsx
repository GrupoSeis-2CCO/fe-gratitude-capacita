import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import UserActions from "../components/UserActions";
import { getEngajamentoPorCurso } from "../services/UserPageService.js";
import { api } from "../services/api.js";
import MonthFilter from "../components/MonthFilter.jsx";
import YearFilter from "../components/YearFilter.jsx";
import ApexLineChart from "../components/ApexLineChart.jsx";
import Chart from 'react-apexcharts';

export function UserPage({ courseId = 1, days = 14 }) {
  const { cursoId, participanteId } = useParams();
  const effectiveCourseId = Number(cursoId || courseId || 1);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [userCard, setUserCard] = useState({ email: "—", dataEntrada: null, ultimoAcesso: null, ultimoCurso: "—" });
  const [selectedParticipantId, setSelectedParticipantId] = useState(participanteId ? Number(participanteId) : null);
  const [selectedMonth, setSelectedMonth] = useState(null); // format: '01'..'12' or null
  const [selectedYear, setSelectedYear] = useState(2025); // default to 2025
  const navigate = useNavigate();
  // chart state

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // engajamento do curso (compute from/to from selectedMonth and/or selectedYear)
        let from = null;
        let to = null;
        if (selectedMonth && selectedYear) {
          // specific month/year -> month selected (selectedMonth like '03') and selectedYear number
          const year = Number(selectedYear);
          const month = Number(selectedMonth);
          const first = new Date(Date.UTC(year, month - 1, 1));
          const last = new Date(Date.UTC(year, month, 0));
          from = `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, '0')}-${String(first.getUTCDate()).padStart(2, '0')}`;
          to = `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}-${String(last.getUTCDate()).padStart(2, '0')}`;
        } else if (selectedYear && !selectedMonth) {
          // whole year
          const year = Number(selectedYear);
          from = `${year}-01-01`;
          to = `${year}-12-31`;
        }

        const resp = await getEngajamentoPorCurso(effectiveCourseId, from, to, days);
        if (!mounted) return;
        const formatted = (resp || []).map(r => ({ date: formatDateForLabel(r.date), value: r.value }));
        setChartData(formatted);

        // carrega dados do usuario (se houver participanteId). Se não houver, tenta pegar o primeiro participante do curso e logar tudo para mapping
        let pid = Number(participanteId);
        if ((!pid || Number.isNaN(pid)) && effectiveCourseId) {
          try {
            const partResp = await api.get(`/matriculas/curso/${effectiveCourseId}/participantes`);
            console.debug('Participants list (fallback):', partResp.status, partResp.data && partResp.data.slice ? partResp.data.slice(0,10) : partResp.data);
            const parts = partResp.data || [];
            if (Array.isArray(parts) && parts.length > 0) {
              // try multiple possible id keys
              pid = parts[0].idUsuario || parts[0].id || parts[0].usuarioId || parts[0].fkUsuario || null;
              console.debug('Fallback selected participante id:', pid, 'participant object:', parts[0]);
            }
          } catch (e) {
            console.warn('Erro ao obter participantes para fallback:', e);
          }
        }

  const pidNum = Number(pid);
  // persist resolved participant id so other UI pieces can link to it
  if (pidNum && !Number.isNaN(pidNum)) setSelectedParticipantId(pidNum);
        if (pidNum && !Number.isNaN(pidNum)) {
          try {
            const uResp = await api.get(`/usuarios/${pid}`);
              const usuario = uResp.data;
              // log bruto do usuário para mapeamento
              console.debug('Raw usuario object for mapping:', usuario);

              // Tentativa de mapear campos comuns (variações entre DTOs)
              const mappedUser = {
                email: usuario?.email || usuario?.emailUsuario || usuario?.email_user || usuario?.mail || usuario?.emailAddress || null,
                dataEntrada: usuario?.dataEntrada || usuario?.data_entrada || usuario?.createdAt || usuario?.dataEntradaIso || null,
                ultimoAcesso: usuario?.ultimoAcesso || usuario?.ultimo_acesso || usuario?.lastAccess || null,
                nome: usuario?.nome || usuario?.fullName || usuario?.name || null
              };
              console.debug('Mapped user fields (to be used in card):', mappedUser);

            // busca matriculas do usuario para descobrir ultimo curso acessado
            const mResp = await api.get(`/matriculas/usuario/${pid}`);
            console.debug('Matriculas raw response for usuario:', mResp.status, mResp.data && mResp.data.slice ? mResp.data.slice(0,10) : mResp.data);
            const matriculas = mResp.data || [];

            // tenta achar a matrícula com ultimoAcesso mais recente
            let ultimoCurso = "—";
            if (Array.isArray(matriculas) && matriculas.length > 0) {
              // matriculas podem ter campo ultimo_senso ou fk_inicio; vamos usar ultimo_senso
              matriculas.sort((a,b) => {
                const da = a.ultimoSenso ? new Date(a.ultimoSenso).getTime() : 0;
                const db = b.ultimoSenso ? new Date(b.ultimoSenso).getTime() : 0;
                return db - da;
              });
              const m = matriculas[0];
              if (m && m.curso && (m.curso.tituloCurso || m.curso.idCurso)) {
                ultimoCurso = m.curso.tituloCurso ? m.curso.tituloCurso : `Curso ${m.curso.idCurso}`;
              } else if (m && m.fkCurso) {
                ultimoCurso = `Curso ${m.fkCurso}`;
              }
            }

            // fallback: se usuario.ultimoAcesso não existir, tente extrair da matrícula mais recente
            let lastAccessFromMatricula = null;
            if (Array.isArray(matriculas) && matriculas.length > 0) {
              const m0 = matriculas[0];
              lastAccessFromMatricula = m0?.ultimoAcesso || m0?.ultimo_senso || m0?.ultimoSenso || m0?.ultimoAcessoIso || m0?.ultimo_senso_iso || null;
            }

            const userCardPayload = {
              email: mappedUser.email || "—",
              dataEntrada: mappedUser.dataEntrada || null,
              // prioridade: mappedUser.ultimoAcesso -> lastAccessFromMatricula -> null
              ultimoAcesso: mappedUser.ultimoAcesso || lastAccessFromMatricula || null,
              ultimoCurso: ultimoCurso
            };
          console.debug('Final userCard set:', { email: mappedUser.email, dataEntrada: mappedUser.dataEntrada, ultimoAcesso: mappedUser.ultimoAcesso, ultimoCurso });
            // Log payload in non-production environments for debugging
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
              console.log('UserCard payload:', userCardPayload);
            }
            setUserCard(userCardPayload);
          } catch (e) {
            // ignora erro e mostra card com defaults
            console.warn("Erro ao buscar dados do usuário/matrículas:", e);
          }
        }
      } catch (err) {
        console.error(err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [effectiveCourseId, days, selectedMonth, participanteId]);

  const maxValue = chartData.length ? Math.max(...chartData.map(d => d.value)) : 0;
  const average = chartData.length ? chartData.reduce((s, d) => s + d.value, 0) / chartData.length : 0;

  // Prepare series and categories for ApexLineChart so tooltip shows correct label
  const seriesForChart = [
    {
      name: 'Materiais Concluídos',
      data: chartData.map(d => d.value)
    }
  ];
  const categoriesForChart = chartData.map(d => d.date);

  // chart rendering handled by ApexLineChart

  return (
    <div className="min-h-screen bg-gray-50 pt-28 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Colaborador y</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <div className="text-gray-700"><strong className="text-gray-900">Email:</strong> {userCard.email}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Primeiro acesso:</strong> {userCard.dataEntrada ? formatIsoDateTime(userCard.dataEntrada) : '—'}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último acesso:</strong> {userCard.ultimoAcesso ? formatIsoDateTime(userCard.ultimoAcesso) : '—'}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último curso acessado:</strong> {userCard.ultimoCurso}</div>
          {selectedParticipantId ? (
            <div className="pt-2">
              <button
                onClick={() => navigate(`/cursos/${effectiveCourseId}/participantes/${selectedParticipantId}/provas`)}
                className="mt-2 inline-flex items-center px-3 py-1 bg-orange-500 text-white rounded text-sm"
              >Ver Provas</button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <UserActions />

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Engajamento Diário do Participante</h2>
          <div style={{ marginBottom: 12 }} className="flex items-center gap-4">
            {/* Month + Year filters */}
            <MonthFilter value={selectedMonth} onChange={setSelectedMonth} />
            <YearFilter value={selectedYear} onChange={setSelectedYear} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div>Carregando...</div>
            ) : !selectedMonth ? (
              <div className="text-center text-gray-600 py-12">
                <strong className="text-gray-800">Selecione um mês para demonstrar desempenho</strong>
                <div className="text-sm mt-2 text-gray-600">Escolha um mês no filtro acima para visualizar o gráfico de materiais concluídos.</div>
              </div>
            ) : chartData.length === 0 ? (
              <div>Nenhum dado disponível</div>
            ) : (
              <>
                <div>
                  {/* Inline chart to ensure tooltip label is 'Materiais Concluídos' */}
                  <InlineApexChart series={seriesForChart} categories={categoriesForChart} height={420} yLabel="Materiais Concluídos" />
                </div>

                {/* x-axis labels are handled by ApexCharts; removed custom labels */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateForLabel(isoDate) {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    // return only the day number (1..31) for compact x-axis labels
    return String(d.getDate());
  } catch (e) {
    return isoDate;
  }
}

function formatIsoDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // Day number
    const day = d.getDate();
    // Month name in Portuguese (full, lowercase)
  let month = d.toLocaleString('pt-BR', { month: 'long' });
  // Garantir primeira letra maiúscula: 'outubro' -> 'Outubro'
  if (month && month.length > 0) month = month.charAt(0).toUpperCase() + month.slice(1);
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} de ${month} de ${year}, ${hours}h${minutes}`;
  } catch (e) {
    return iso;
  }
}

export default UserPage;

// Inline ApexCharts wrapper used only in this example to force tooltip labels
function InlineApexChart({ series = [], categories = [], height = 400, yLabel = 'Valor' }) {
  // Build options to override tooltip y label
  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    xaxis: {
      categories: categories,
      labels: { rotate: -45 }
    },
    yaxis: {
      title: { text: yLabel }
    },
    stroke: { curve: 'smooth' },
    markers: { size: 5 },
    tooltip: {
      shared: false,
      x: {
        formatter: function (val) {
          // val is the category (date label)
          return val;
        }
      },
      y: {
        // force the title shown before the value to be yLabel
        title: {
          formatter: function () {
            return yLabel;
          }
        },
        formatter: function (val) {
          return `${val}`;
        }
      }
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
}
