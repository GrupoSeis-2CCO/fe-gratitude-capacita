import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import { getFeedbacksByCurso } from "../services/feedbackService.js";

export default function FeedbackPage() {
  const { idCurso } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("ALL");

  useEffect(() => {
    if (!idCurso) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeedbacksByCurso(idCurso);
        if (mounted) setFeedbacks(Array.isArray(data) ? data.map(normalizeFeedback) : []);
      } catch (e) {
        if (mounted) setError(e.message || "Erro ao carregar feedbacks");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [idCurso]);

  const normalizeFeedback = (item) => {
    if (!item) return { usuarioId: null, aluno: null, estrelas: 0, motivo: null };
    return {
      usuarioId: item.usuarioId ?? item.fk_usuario ?? item.fkUsuario ?? item.id_usuario ?? null,
      aluno: item.aluno ?? item.nome ?? item.usuarioNome ?? item.nomeUsuario ?? null,
      estrelas: Math.min(5, Math.max(0, Number(item.estrelas ?? item.star ?? item.rating ?? 0) || 0)),
      motivo: item.motivo ?? item.comentario ?? item.observacao ?? item.mensagem ?? null,
      cursoTitulo: item.cursoTitulo ?? item.titulo_curso ?? null,
      cursoId: item.cursoId ?? item.curso_id ?? item.FK_curso ?? item.FK_curso ?? null,
    };
  };

  const filteredFeedbacks = useMemo(() => {
    if (ratingFilter === "ALL") return feedbacks;
    const want = Number(ratingFilter);
    return feedbacks.filter((f) => Number(f.estrelas) === want);
  }, [feedbacks, ratingFilter]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ));

  const cursoTitulo = feedbacks.length > 0 ? feedbacks[0].cursoTitulo : null;

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-8">
          <TituloPrincipal>
            Analisar Feedbacks do Curso {cursoTitulo ? `- ${cursoTitulo}` : `#${idCurso}`}
          </TituloPrincipal>
        </div>

        <div className="mt-8 w-full">
          <div className="mb-6 flex items-center justify-between">
            <label className="sr-only" htmlFor="ratingFilter">Filtrar por avaliação</label>
            <select
              id="ratingFilter"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Filtrar feedbacks por avaliação"
            >
              <option value="ALL">Todos</option>
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
              <option value="2">2 estrelas</option>
              <option value="1">1 estrela</option>
            </select>

            <div className="text-sm text-gray-600">
              {loading ? "Carregando..." : error ? `Erro: ${error}` : `${filteredFeedbacks.length} resultado(s)`}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="space-y-6">
              {loading && <div className="text-center text-sm text-gray-600">Carregando feedbacks...</div>}
              {!loading && error && <div className="text-center text-sm text-red-600">Não foi possível carregar feedbacks.</div>}
              {!loading && !error && filteredFeedbacks.length === 0 && <div className="text-center text-sm text-gray-600">Nenhum feedback encontrado.</div>}

              {!loading && !error && filteredFeedbacks.map((feedback, idx) => (
                <div key={`${feedback.usuarioId ?? "anon"}-${idx}`} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {feedback.aluno ?? `Usuário ${feedback.usuarioId ?? "N/A"}`}
                    </h3>
                    <div className="flex items-center">{renderStars(Number(feedback.estrelas) || 0)}</div>
                  </div>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    {feedback.motivo ?? "Nenhum comentário feito por esse colaborador. / -"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}