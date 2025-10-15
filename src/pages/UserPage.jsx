import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import UserActions from "../components/UserActions";
import { getEngajamentoPorCurso } from "../services/UserPageService.js";
import { api } from "../services/api.js";
import MonthFilter from "../components/MonthFilter.jsx";
import YearFilter from "../components/YearFilter.jsx";
import ApexLineChart from "../components/ApexLineChart.jsx";

export function UserPage({ courseId = 1, days = 14 }) {
  const { cursoId, participanteId } = useParams();
  const effectiveCourseId = Number(cursoId || courseId || 1);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [userCard, setUserCard] = useState({ email: "—", dataEntrada: null, ultimoAcesso: null, ultimoCurso: "—" });
  const [selectedMonth, setSelectedMonth] = useState(null); // format: '01'..'12' or null
  const [selectedYear, setSelectedYear] = useState(2025); // default to 2025
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

        // carrega dados do usuario (se houver participanteId)
        const pid = Number(participanteId);
        if (pid && !Number.isNaN(pid)) {
          try {
            const uResp = await api.get(`/usuarios/${pid}`);
            const usuario = uResp.data;

            // busca matriculas do usuario para descobrir ultimo curso acessado
            const mResp = await api.get(`/matriculas/usuario/${pid}`);
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

            setUserCard({
              email: usuario.email || "—",
              dataEntrada: usuario.dataEntrada || null,
              ultimoAcesso: usuario.ultimoAcesso || null,
              ultimoCurso: ultimoCurso
            });
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
                  <ApexLineChart data={chartData} height={420} />
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
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return isoDate;
  }
}

function formatIsoDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('pt-BR');
  } catch (e) {
    return iso;
  }
}

export default UserPage;
