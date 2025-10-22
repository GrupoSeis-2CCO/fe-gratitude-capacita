import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getParticipantesByCurso } from "../services/classUsersPageService.js";
import Table from "../components/Table";
import GradientSideRail from "../components/GradientSideRail.jsx";
import Button from "../components/Button.jsx";

export function ClassUsersPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const navigate = useNavigate();
  const { idCurso } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proteção de rota
  if (!isLoggedIn() || userType !== 1) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔵 [FRONT] Chamando getParticipantesByCurso com idCurso:", idCurso);
  const data = await getParticipantesByCurso(idCurso, { page, size });
        console.log("🟢 [FRONT] Dados recebidos do backend:", data);
  const list = data?.content ?? (Array.isArray(data) ? data : []);

  const participantesMapeados = (list || []).map(p => {
          // Materiais: usa os campos que o backend agora fornece
          const materiaisConcluidos = Number(p.materiaisConcluidos) || 0;
          const materiaisTotais = Number(p.materiaisTotais) || 0;
          const materiaisDisplay = `${materiaisConcluidos}/${materiaisTotais}`;

          // Avaliação: converte para escala 0..10 e formata "X de 10"
          let avaliacaoDisplay = "Não Feita";
          if (p.avaliacao !== null && p.avaliacao !== undefined && p.avaliacao !== "") {
            const raw = Number(p.avaliacao);
            if (!Number.isNaN(raw)) {
              let nota;
              // heurística de conversão:
              // - se receber 0..1 (ex.: 0.2) -> multiplica por 10
              // - se receber 0..5 (ex.: 4.5) -> multiplica por 2
              // - se receber >5 assume já em 0..10
              if (raw <= 1) {
                nota = Math.round(raw * 10);
              } else if (raw <= 5) {
                nota = Math.round(raw * 2);
              } else {
                nota = Math.round(raw);
              }
              avaliacaoDisplay = `${nota} de 10`;
            }
          }

          // Último acesso: formata para "03 de abril de 2025, 12h15"
          const formatUltimoAcesso = (iso) => {
            if (!iso) return "Nunca acessou";
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return "Nunca acessou";
            const day = String(d.getDate()).padStart(2, "0");
            const month = d.toLocaleString("pt-BR", { month: "long" });
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            return `${day} de ${month} de ${year}, ${hours}h${minutes}`;
          };

          const ultimoAcesso = formatUltimoAcesso(p.ultimoAcesso);

          return {
            id: p.idUsuario,
            nome: p.nome || "Sem nome",
            materiais: materiaisDisplay,
            avaliacao: avaliacaoDisplay,
            ultimoAcesso,
          };
        });

  setParticipantes(participantesMapeados);
  setTotalPages(Number(data?.totalPages || 0));
  setTotalElements(Number(data?.totalElements || participantesMapeados.length));
      } catch (err) {
        console.error("❌ [FRONT] Erro ao buscar participantes:", err?.message || err);
        setError(err?.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    console.log("🟡 [FRONT] useEffect disparado, idCurso:", idCurso);
    if (idCurso) {
      fetchParticipantes();
    }
  }, [idCurso, page, size]);

  const columns = [
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Materiais (concluídos/total)", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" },
  ];

  function Pagination() {
    const canPrev = page > 0;
    const canNext = totalPages ? (page + 1) < totalPages : (participantes.length === size);
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Página {page + 1}{totalPages ? ` de ${totalPages}` : ''} • {totalElements} itens
        </div>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 border rounded ${canPrev ? 'text-gray-800' : 'text-gray-400 cursor-not-allowed'}`} disabled={!canPrev} onClick={() => setPage(p => Math.max(0, p - 1))}>Anterior</button>
          <select className="px-2 py-1 border rounded" value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}>
            {[5,10,20,50].map(s => <option key={s} value={s}>{s}/página</option>)}
          </select>
          <button className={`px-3 py-1 border rounded ${canNext ? 'text-gray-800' : 'text-gray-400 cursor-not-allowed'}`} disabled={!canNext} onClick={() => setPage(p => p + 1)}>Próxima</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-12">
      <GradientSideRail className="left-10" />
      <GradientSideRail variant="inverted" className="right-10" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="Ghost" label="← Voltar" onClick={() => navigate(`/cursos/${idCurso}`)} />
            <h1 className="text-3xl font-extrabold text-gray-900">Participantes do Curso</h1>
            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">{participantes.length} participantes</span>
          </div>
        </div>

        {/* Card wrapper */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            {/* Exibe erro se houver */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong className="font-semibold">Erro:</strong>
                <div className="mt-1 text-sm">{error}</div>
              </div>
            )}

            {/* Exibe loading */}
            {loading && !error && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-pulse bg-indigo-100 rounded-full w-12 h-12 mb-4" />
                <div className="text-gray-600">Carregando participantes...</div>
              </div>
            )}

            {/* Exibe mensagem se não houver participantes */}
            {!loading && !error && participantes.length === 0 && (
              <div className="text-center text-gray-600 py-12">
                <div className="text-lg font-medium mb-2">Nenhum participante encontrado</div>
                <div className="text-sm text-gray-500">Quando colaboradores se inscreverem neste curso, eles aparecerão aqui.</div>
              </div>
            )}

            {/* Exibe a tabela */}
            {!loading && !error && participantes.length > 0 && (
              <div>
                <Table
                  onClickRow={row => navigate(`/cursos/${idCurso}/participante/${row.id}`)}
                  columns={columns}
                  data={participantes}
                />
                <Pagination />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}