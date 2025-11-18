import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Table from "../components/Table";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import AccessPageService from "../services/AccessPageService.js";

export function AccessPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const navigate = useNavigate();

  // Proteção: apenas funcionários (tipo 1) podem acessar esta página
  if (!isLoggedIn() || userType !== 1) {
    return <Navigate to="/login" replace />;
  }

  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState("");
  const [buscaNome, setBuscaNome] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // carrega lista de cursos ao montar
    (async () => {
      try {
        // registra acesso geral do usuário (log simples de entrada na tela)
        try {
          const raw = localStorage.getItem('usuarioId');
          let uid = raw ? Number(String(raw).trim()) : undefined;
          if (!uid) {
            const token = localStorage.getItem('token');
            if (token) {
              const parts = token.split('.');
              if (parts.length === 3) {
                try {
                  const payload = JSON.parse(atob(parts[1]));
                  uid = Number(payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub);
                } catch (_) { /* ignore */ }
              }
            }
          }
          if (uid) {
            // fire and forget
            AccessPageService.registrarAcessoGeral(uid).catch(() => {});
          }
        } catch (_) { /* ignore */ }

        const lista = await AccessPageService.listarCursos();
        setCursos(lista);
        // Não selecionar automaticamente; deixar placeholder "Selecione" ativo
      } catch (e) {
        setError(e?.message || "Erro ao carregar cursos");
      }
    })();
  }, []);

  useEffect(() => {
    // busca participantes quando curso muda
    if (!cursoSelecionado) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await AccessPageService.listarParticipantesPorCurso(Number(cursoSelecionado), { page, size });
        // Ordena alfabeticamente por nome por padrão (pt-BR, sensibilidade base)
        const received = resp.content || [];
        const participantesOrdenados = (received || []).slice().sort((a, b) =>
          String(a?.nome || "").localeCompare(String(b?.nome || ""), 'pt-BR', { sensitivity: 'base' })
        );
        setParticipantes(participantesOrdenados);
        setTotalPages(Number(resp.totalPages || 0));
        setTotalElements(Number(resp.totalElements || (resp.content || []).length));
      } catch (e) {
        setError(e?.message || "Erro ao carregar participantes");
        setParticipantes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cursoSelecionado, page, size]);

  const columns = useMemo(() => ([
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Status", accessor: "status" },
    { header: "Materiais Concluídos", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" }
  ]), []);

  const dadosTabela = useMemo(() => {
    const term = (buscaNome || "").toLowerCase();
    const rows = (participantes || [])
      .filter(p => !term || (p?.nome || "").toLowerCase().includes(term))
      .map(p => {
        const materiais = `${p?.materiaisConcluidos ?? 0}/${p?.materiaisTotais ?? 0}`;
        // Mostrar nota da última tentativa conforme requisito
        let avaliacao = "Não feita";
        if (p && (p.ultimaNotaAcertos != null) && (p.ultimaNotaTotal != null)) {
          avaliacao = `${p.ultimaNotaAcertos} de ${p.ultimaNotaTotal}`;
        }
        const ultimo = p?.ultimoAcesso ? new Date(p.ultimoAcesso) : null;
        const ultimoFmt = ultimo ? ultimo.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : "-";

        // Status: Ativo se acessou nos últimos 15 dias, caso contrário Inativo
        const now = new Date();
        let isActive = false;
        if (ultimo && !Number.isNaN(ultimo.getTime())) {
          const diffMs = now.getTime() - ultimo.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          isActive = diffDays <= 15;
        }

        const statusTitle = isActive
          ? 'Ativo — participante acessou nos últimos 15 dias (baseado no Último acesso)'
          : 'Inativo — participante NÃO acessou nos últimos 15 dias (baseado no Último acesso)';

        const statusNode = (
          <div className="flex items-center gap-2" title={statusTitle}>
            <span className={`${isActive ? 'w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-emerald-800' : 'w-3 h-3 rounded-full bg-red-600 ring-1 ring-red-800'}`} />
            <span className="text-sm font-medium text-gray-800">{isActive ? 'Ativo' : 'Inativo'}</span>
          </div>
        );

        return {
          id: p?.idUsuario,
          nome: p?.nome || "-",
          status: statusNode,
          materiais,
          avaliacao,
          ultimoAcesso: ultimoFmt,
        };
      });

    // preencher linhas vazias para manter espaçamento visual (opcional)
    // usar o `size` da paginação para garantir exatamente `size` linhas por página
    const desiredRows = Number(size) || 10;
    const fillerCount = Math.max(0, desiredRows - rows.length);
    for (let i = 0; i < fillerCount; i++) {
      rows.push({ id: null, nome: "-", status: '-', materiais: "-", avaliacao: "-", ultimoAcesso: "-" });
    }
    return rows;
  }, [participantes, buscaNome, size]);

  const cursoSelecionadoObj = useMemo(() => {
    const idNum = Number(cursoSelecionado);
    return (cursos || []).find(c => Number(c.idCurso) === idNum) || null;
  }, [cursos, cursoSelecionado]);

  function Pagination() {
    const canPrev = page > 0;
    const canNext = totalPages ? (page + 1) < totalPages : (participantes.length === size);
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Página {page + 1}{totalPages ? ` de ${totalPages}` : ''} • {totalElements} itens
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 border rounded ${canPrev ? 'text-gray-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
            disabled={!canPrev}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <select
            className="px-2 py-1 border rounded"
            value={size}
            onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}
          >
            {[5,10,20,50].map(s => <option key={s} value={s}>{s}/página</option>)}
          </select>
          <button
            className={`px-3 py-1 border rounded ${canNext ? 'text-gray-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
            disabled={!canNext}
            onClick={() => setPage(p => p + 1)}
          >
            Próxima
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>
            {cursoSelecionadoObj ? `Participantes do ${cursoSelecionadoObj.tituloCurso || `Curso ${cursoSelecionadoObj.idCurso}`}` : 'Participantes'}
          </TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <div className="w-[65rem]">
            {/* Search and Filter Section */}
            <div className="bg-[#FFF3ED] rounded-lg shadow-md p-4 mb-6 flex items-center gap-4 border border-[#FFD6BC]">
              {/* Search Input */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Procurar colaborador..."
                    value={buscaNome}
                    onChange={e => setBuscaNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Label with total participants between name filter and course filter */}
              <div className="text-sm text-gray-700 font-medium">
                {`Total de participantes: `}
                <span className="font-semibold">{Number(totalElements) || (participantes || []).length || 0}</span>
              </div>

              {/* Course Filter Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                  value={cursoSelecionado}
                  onChange={(e) => setCursoSelecionado(e.target.value)}
                >
                  <option value="" disabled>Selecione</option>
                  {cursos.map(c => (
                    <option key={c.idCurso} value={c.idCurso}>{c.tituloCurso || `Curso ${c.idCurso}`}</option>
                  ))}
                </select>
                {/* Status legend with hover explanations */}
                    <div className="ml-4 flex items-center gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1 cursor-default" title="Ativo: participante acessou nos últimos 15 dias (baseado no Último acesso)">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-emerald-800" />
                      <span>Ativo</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-default" title="Inativo: participante NÃO acessou nos últimos 15 dias (baseado no Último acesso)">
                      <span className="w-3 h-3 rounded-full bg-red-600 ring-1 ring-red-800" />
                      <span>Inativo</span>
                    </div>
                  </div>

                {/* Total count badge (compact) placed to the right of the filter controls */}
                {/* compact badge removed — number is shown inline to the left */}
              </div>
            </div>

            <div className="rounded-lg border border-[#FFD6BC] bg-[#FFF0E6] p-4 shadow-md">
              {loading ? (
                <div className="text-gray-700 px-2 py-3">Carregando...</div>
              ) : error ? (
                <div className="text-red-600 px-2 py-3">{error}</div>
              ) : (
                <>
                <Table
                  columns={columns}
                  data={dadosTabela}
                  headerClassName="bg-[#FF6B35] text-white text-[1.125rem] font-bold"
                  rowClassName="odd:bg-[#FFE8DA] even:bg-[#FFCDB2] hover:bg-[#ffb877] transition-colors"
                  onClickRow={(row) => {
                    if (row.id && row.nome !== "-") {
                      navigate(`/cursos/${cursoSelecionado}/participante/${row.id}`);
                    }
                  }}
                />
                <Pagination />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessPage;
