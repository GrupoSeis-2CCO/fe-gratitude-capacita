import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import UserActions from "../components/UserActions";
import { getEngajamentoPorCurso } from "../services/UserPageService.js";
import { api } from "../services/api.js";
import MonthFilter from "../components/MonthFilter.jsx";
import YearFilter from "../components/YearFilter.jsx";
import Chart from 'react-apexcharts';

export function UserPage({ courseId = 1, days = 14 }) {
  const { cursoId, participanteId } = useParams();
  const effectiveCourseId = Number(cursoId || courseId || 1);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [userCard, setUserCard] = useState({ 
    email: "—", 
    dataEntrada: null, 
    ultimoAcesso: null, 
    ultimoCurso: "—" 
  });
  const [selectedMonth, setSelectedMonth] = useState(null); // Nenhum mês selecionado por padrão
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Ano atual como padrão

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // Calcula datas from/to baseado nos filtros
        let from = null;
        let to = null;
        if (selectedMonth && selectedYear) {
          const year = Number(selectedYear);
          const month = Number(selectedMonth);
          const first = new Date(Date.UTC(year, month - 1, 1));
          const last = new Date(Date.UTC(year, month, 0));
          from = `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, '0')}-${String(first.getUTCDate()).padStart(2, '0')}`;
          to = `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}-${String(last.getUTCDate()).padStart(2, '0')}`;
        } else if (selectedYear && !selectedMonth) {
          const year = Number(selectedYear);
          from = `${year}-01-01`;
          to = `${year}-12-31`;
        }

        const resp = await getEngajamentoPorCurso(effectiveCourseId, from, to, days);
        if (!mounted) return;
        
        const mapped = (resp || []).map((r, idx) => {
          const iso = r && (r.date || r.data || r.dataHora || r.iso) ? (r.date || r.data || r.dataHora || r.iso) : null;
          const dt = iso ? new Date(iso) : new Date();
          const ts = Number.isNaN(dt.getTime()) ? idx : dt.getTime();
          const day = Number.isNaN(dt.getTime()) ? (idx + 1) : dt.getDate();
          return { iso, ts, day, value: r.value ?? 0 };
        });
        mapped.sort((a, b) => a.ts - b.ts);
        setChartData(mapped);

        // Carrega dados do usuário
        await loadUserData();

      } catch (err) {
        console.error(err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadUserData() {
      let pid = Number(participanteId);
      
      if ((!pid || Number.isNaN(pid)) && effectiveCourseId) {
        try {
          const partResp = await api.get(`/matriculas/curso/${effectiveCourseId}/participantes`);
          const parts = partResp.data || [];
          if (Array.isArray(parts) && parts.length > 0) {
            pid = parts[0].idUsuario || parts[0].id || parts[0].usuarioId || parts[0].fkUsuario || null;
          }
        } catch (e) {
          console.warn('Erro ao obter participantes para fallback:', e);
        }
      }

      const pidNum = Number(pid);
      if (pidNum && !Number.isNaN(pidNum)) {
        try {
          const uResp = await api.get(`/usuarios/${pid}`);
          const usuario = uResp.data;

          const mappedUser = {
            email: usuario?.email || usuario?.emailUsuario || usuario?.email_user || usuario?.mail || usuario?.emailAddress || null,
            dataEntrada: usuario?.dataEntrada || usuario?.data_entrada || usuario?.createdAt || usuario?.dataEntradaIso || null,
            ultimoAcesso: usuario?.ultimoAcesso || usuario?.ultimo_acesso || usuario?.lastAccess || null,
            nome: usuario?.nome || usuario?.fullName || usuario?.name || null
          };

          const mResp = await api.get(`/matriculas/usuario/${pid}`);
          const matriculas = mResp.data || [];

          let ultimoCurso = "—";
          let lastAccessFromMatricula = null;
          
          if (Array.isArray(matriculas) && matriculas.length > 0) {
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
            
            lastAccessFromMatricula = m?.ultimoAcesso || m?.ultimo_senso || m?.ultimoSenso || m?.ultimoAcessoIso || m?.ultimo_senso_iso || null;
          }

          const userCardPayload = {
            email: mappedUser.email || "—",
            dataEntrada: mappedUser.dataEntrada || null,
            ultimoAcesso: mappedUser.ultimoAcesso || lastAccessFromMatricula || null,
            ultimoCurso: ultimoCurso
          };

          setUserCard(userCardPayload);
        } catch (e) {
          console.warn("Erro ao buscar dados do usuário/matrículas:", e);
        }
      }
    }

    load();
    return () => { mounted = false };
  }, [effectiveCourseId, days, selectedMonth, selectedYear, participanteId]);

  // Prepara dados para o gráfico - GARANTINDO TODOS OS DIAS DO MÊS
  const chartSeries = (() => {
    if (!selectedMonth || !selectedYear) {
      return [{ name: 'Materiais Concluídos', data: [] }];
    }

    const year = Number(selectedYear);
    const month = Number(selectedMonth);
    const lastDay = new Date(year, month, 0).getDate();

    // Cria um mapa com todos os dados existentes
    const valueMap = {};
    chartData.forEach(d => {
      try {
        const dt = new Date(d.ts);
        if (!Number.isNaN(dt.getTime())) {
          const day = dt.getDate();
          valueMap[day] = d.value ?? 0;
        }
      } catch (e) { 
        console.warn('Erro ao processar data:', e);
      }
    });

    // Gera dados para TODOS os dias do mês
    const data = [];
    for (let day = 1; day <= lastDay; day++) {
      const timestamp = Date.UTC(year, month - 1, day);
      const value = valueMap[day] ?? 0; // Usa 0 para dias sem dados
      data.push({ 
        x: timestamp, 
        y: value 
      });
    }

    return [{ name: 'Materiais Concluídos', data }];
  })();

  // Configurações do gráfico
  // calcular dias do mês para forçar ticks por dia quando houver mês selecionado
  const daysInMonth = (selectedMonth && selectedYear) ? new Date(Number(selectedYear), Number(selectedMonth), 0).getDate() : null;

  const chartOptions = {
    chart: {
      type: 'line',
      height: 420,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#FF6B35']
    },
    markers: {
      size: 4,
      hover: { size: 6 }
    },
    colors: ['#FF6B35'],
    xaxis: {
      type: 'datetime',
      labels: {
        rotate: -45,
        hideOverlappingLabels: false,
        formatter: function (val) {
          try {
            const d = new Date(val);
            if (!Number.isNaN(d.getTime())) {
              return `${d.getDate()}`; // Mostra apenas o dia
            }
          } catch (e) {
            console.warn('Erro ao formatar data do eixo X:', e);
          }
          return '';
        }
      },
      // quando um mês está selecionado, force um tick para cada dia
      tickAmount: daysInMonth || 'dataPoints',
    },
    yaxis: {
      title: { 
        text: 'Materiais Concluídos',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: function (val) {
          return Math.round(val); // Valores inteiros no eixo Y
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      x: {
        formatter: function (val) {
          const date = new Date(val);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          return `${day} de ${monthNames[month - 1]} de ${year}`;
        }
      },
      y: {
        title: {
          formatter: function () { return 'Materiais Concluídos:'; }
        },
        formatter: function (val) { 
          return val !== null && val !== undefined ? 
            `${val} material${val !== 1 ? 's' : ''}` : 
            '0 materiais'; 
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  // Estatísticas removidas - exibiremos somente o gráfico conforme solicitado

  return (
    <div className="min-h-screen bg-gray-50 pt-28 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard do Colaborador</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <div className="text-gray-700">
            <strong className="text-gray-900">Email:</strong> {userCard.email}
          </div>
          <div className="text-gray-700">
            <strong className="text-gray-900">Primeiro acesso:</strong> {userCard.dataEntrada ? formatIsoDateTime(userCard.dataEntrada) : '—'}
          </div>
          <div className="text-gray-700">
            <strong className="text-gray-900">Último acesso:</strong> {userCard.ultimoAcesso ? formatIsoDateTime(userCard.ultimoAcesso) : '—'}
          </div>
          <div className="text-gray-700">
            <strong className="text-gray-900">Último curso acessado:</strong> {userCard.ultimoCurso}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${selectedMonth ? 'min-h-[460px] w-full' : 'min-h-[160px] w-full'}`}>
          <UserActions expanded={!!selectedMonth} />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Engajamento Diário do Participante</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <MonthFilter value={selectedMonth} onChange={setSelectedMonth} />
            <YearFilter value={selectedYear} onChange={setSelectedYear} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">Carregando dados...</div>
              </div>
            ) : !selectedMonth ? (
              <div className="text-center text-gray-600 py-12">
                <strong className="text-gray-800 block text-lg mb-2">Selecione um mês para demonstrar desempenho</strong>
                <div className="text-sm text-gray-600">Escolha um mês no filtro acima para visualizar o gráfico de materiais concluídos.</div>
              </div>
            ) : (
              <>
                {/* Estatísticas removidas: mantendo apenas o gráfico abaixo */}

                {/* Gráfico */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Chart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type="line" 
                    height={420} 
                  />
                </div>

                {/* Informações */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                  <div className="inline-flex items-center">
                    <div className="w-3 h-3 bg-[#FF6B35] rounded-full mr-2"></div>
                    Materiais Concluídos por Dia
                  </div>
                  <div className="text-xs text-gray-500">
                    Mostrando todos os {chartSeries[0]?.data.length || 0} dias de {selectedMonth.toString().padStart(2, '0')}/{selectedYear}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatIsoDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    
    const day = d.getDate();
    let month = d.toLocaleString('pt-BR', { month: 'long' });
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