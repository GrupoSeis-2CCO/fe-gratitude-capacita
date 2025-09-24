import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import feedbackService from "../services/feedbackService";
import { useAuth } from "../hooks/useAuth";

export default function SubmitFeedbackPage() {
  const { idCurso } = useParams();
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();

  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.isAuthenticated) {
      alert("Você precisa estar logado para enviar um feedback.");
      navigate("/login");
      return;
    }

    if (!stars || stars < 1 || stars > 5) {
      setError("Selecione uma pontuação entre 1 e 5 estrelas.");
      return;
    }

    try {
      setLoading(true);

      // Monta o corpo conforme o backend (CriarFeedbackCommand)
      const body = {
        idCurso: parseInt(idCurso, 10),
        estrelas: parseInt(stars, 10),
        motivo: comment || null,
        fkUsuario: null, // backend aceita null, vincula pelo token quando existir; ajuste se necessário
      };

      await feedbackService.createFeedback(body);
      setSuccess("Feedback enviado com sucesso!");

      // Opcional: redirecionar após um pequeno delay para a lista de feedbacks
      setTimeout(() => navigate(`/cursos/${idCurso}/feedbacks`), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Erro ao enviar feedback.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderInteractiveStars = () => (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type="button"
          className={`text-3xl focus:outline-none ${n <= stars ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => setStars(n)}
          aria-label={`${n} estrelas`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Enviar Feedback para o Curso {idCurso}</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <form onSubmit={handleSubmit} className="w-[65rem] rounded-lg border-[0.1875rem] border-[#1D262D] bg-white p-6 shadow-[0_0_0_0.1875rem_#1D262D]">
            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{success}</div>
            )}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Sua avaliação</label>
              {renderInteractiveStars()}
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="block text-gray-700 font-semibold mb-2">Comentário (opcional)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                placeholder="Escreva seu feedback..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar Feedback"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
