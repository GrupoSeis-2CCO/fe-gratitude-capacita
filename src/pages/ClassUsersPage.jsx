import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getParticipantesByCurso } from "../services/classUsersPageService.js";
import Table from "../components/Table";
import GradientSideRail from "../components/GradientSideRail.jsx";

export function ClassUsersPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const navigate = useNavigate();
  const { idCurso } = useParams();
  const [participantes, setParticipantes] = useState([]);
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
        const data = await getParticipantesByCurso(idCurso);
        console.log("🟢 [FRONT] Dados recebidos do backend:", data);

        const participantesMapeados = (data || []).map(p => {
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
  }, [idCurso]);

  const columns = [
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Materiais (concluídos/total)", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 p-8">
      <GradientSideRail className="left-10" />
      <GradientSideRail variant="inverted" className="right-10" />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Participantes do Curso
        </h1>

        {/* Exibe erro se houver */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Exibe loading */}
        {loading && !error && (
          <div className="text-center text-gray-600 py-8">Carregando participantes...</div>
        )}

        {/* Exibe mensagem se não houver participantes */}
        {!loading && !error && participantes.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            Nenhum participante encontrado para este curso.
          </div>
        )}

        {/* Exibe a tabela */}
        {!loading && !error && participantes.length > 0 && (
          <Table
            onClickRow={row => navigate(`/cursos/${idCurso}/participante/${row.id}`)}
            columns={columns}
            data={participantes}
          />
        )}
      </div>
    </div>
  );
}