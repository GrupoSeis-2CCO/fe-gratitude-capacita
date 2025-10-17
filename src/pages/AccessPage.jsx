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
        if (lista && lista.length > 0) {
          setCursoSelecionado(String(lista[0].idCurso));
        }
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
        const resp = await AccessPageService.listarParticipantesPorCurso(Number(cursoSelecionado));
        setParticipantes(resp);
      } catch (e) {
        setError(e?.message || "Erro ao carregar participantes");
        setParticipantes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cursoSelecionado]);

  const columns = useMemo(() => ([
    { header: "Nome do Colaborador", accessor: "nome" },
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
        return {
          id: p?.idUsuario,
          nome: p?.nome || "-",
          materiais,
          avaliacao,
          ultimoAcesso: ultimoFmt,
        };
      });

    // preencher linhas vazias para manter espaçamento visual (opcional)
    const fillerCount = Math.max(0, 12 - rows.length);
    for (let i = 0; i < fillerCount; i++) {
      rows.push({ id: null, nome: "-", materiais: "-", avaliacao: "-", ultimoAcesso: "-" });
    }
    return rows;
  }, [participantes, buscaNome]);

  const cursoSelecionadoObj = useMemo(() => {
    const idNum = Number(cursoSelecionado);
    return (cursos || []).find(c => Number(c.idCurso) === idNum) || null;
  }, [cursos, cursoSelecionado]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
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
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
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

              {/* Course Filter Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                  value={cursoSelecionado}
                  onChange={(e) => setCursoSelecionado(e.target.value)}
                >
                  {cursos.map(c => (
                    <option key={c.idCurso} value={c.idCurso}>{c.tituloCurso || `Curso ${c.idCurso}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
              {loading ? (
                <div className="text-white px-2 py-3">Carregando...</div>
              ) : error ? (
                <div className="text-red-300 px-2 py-3">{error}</div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessPage;
