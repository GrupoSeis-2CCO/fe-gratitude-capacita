import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import FeedbackModal from "../components/FeedbackModal.jsx";
import { useAuth } from "../hooks/useAuth";
import feedbackService from "../services/feedbackService.js";

export default function FeedbackPage() {
  const { idCurso } = useParams();
  const { getCurrentUser } = useAuth();
  const { idUsuario, isAuthenticated } = getCurrentUser();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starFilter, setStarFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [userHasFeedback, setUserHasFeedback] = useState(false);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getFeedbacksByCourse(idCurso);
      
      // Transformar dados do backend para o formato esperado pelo frontend
      const transformedFeedbacks = data.map((feedback) => ({
        id: `${feedback.fkUsuario?.idUsuario}-${feedback.fkCurso}`,
        aluno: feedback.fkUsuario?.nome || 'Usuário Anônimo',
        rating: feedback.estrelas,
        comentario: feedback.motivo || 'Nenhum comentário feito por esse colaborador.'
      }));
      
      setFeedbacks(transformedFeedbacks);
      // Marcar se o usuário já possui feedback neste curso
      if (isAuthenticated && idUsuario) {
        const exists = transformedFeedbacks.some(fb => `${idUsuario}-${idCurso}` === String(fb.id));
        setUserHasFeedback(exists);
      } else {
        setUserHasFeedback(false);
      }
    } catch (err) {
      console.error('Erro ao carregar feedbacks:', err);
      setError('Erro ao carregar os feedbacks. Tente novamente.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    if (!starFilter || starFilter === 'Todos') {
      setFilteredFeedbacks(feedbacks);
    } else {
      const stars = parseInt(starFilter.split(' ')[0]);
      setFilteredFeedbacks(feedbacks.filter(feedback => feedback.rating === stars));
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    loadFeedbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCurso]);

  useEffect(() => {
    filterFeedbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbacks, starFilter]);

  const handleFilterChange = (e) => {
    setStarFilter(e.target.value);
  };

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize));
  const paginated = filteredFeedbacks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openModal = () => {
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmitFeedback = async ({ stars, comment }) => {
    setSubmitError(null);
    if (!stars || stars < 1 || stars > 5) {
      setSubmitError("Selecione entre 1 e 5 estrelas.");
      return;
    }
    try {
      setSubmitting(true);
      await feedbackService.createFeedback({
        idCurso: parseInt(idCurso, 10),
        estrelas: parseInt(stars, 10),
        motivo: comment || null,
        fkUsuario: idUsuario ?? null,
      });
      closeModal();
      await loadFeedbacks();
    } catch (err) {
      if (err?.response?.status === 409) {
        setSubmitError("Você já enviou um feedback para este curso.");
        setUserHasFeedback(true);
        return;
      }
      const msg = err?.response?.data?.message || err?.message || "Erro ao enviar feedback.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-2xl ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Analisar Feedbacks do Curso {idCurso}</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <div className="w-[65rem]">
            {/* Toolbar: Filter + New Feedback */}
            <div className="mb-6 flex items-center justify-between">
              <select 
                className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                value={starFilter}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="5 estrelas">5 estrelas</option>
                <option value="4 estrelas">4 estrelas</option>
                <option value="3 estrelas">3 estrelas</option>
                <option value="2 estrelas">2 estrelas</option>
                <option value="1 estrela">1 estrela</option>
              </select>
              <button
                type="button"
                onClick={userHasFeedback ? undefined : openModal}
                disabled={userHasFeedback}
                aria-disabled={userHasFeedback}
                title={userHasFeedback ? "Feedback enviado" : "Enviar feedback"}
                className={`px-4 py-2 rounded-lg text-white ${
                  userHasFeedback
                    ? "bg-gray-400 cursor-not-allowed disabled:opacity-60"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {userHasFeedback ? "Feedback enviado" : "+ Enviar feedback"}
              </button>
            </div>

            {/* Feedbacks Container */}
            <div className="rounded-lg border-[0.1875rem] border-[#1D262D] bg-white p-6 shadow-[0_0_0_0.1875rem_#1D262D]">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-gray-600">Carregando feedbacks...</div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-8">
                  <div className="text-lg text-red-600 mb-4">{error}</div>
                  <button 
                    onClick={loadFeedbacks}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-gray-600">
                    {feedbacks.length === 0 
                      ? 'Nenhum feedback encontrado para este curso.' 
                      : 'Nenhum feedback corresponde ao filtro selecionado.'
                    }
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginated.map((feedback) => (
                    <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      {/* Student Name and Rating */}
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {feedback.aluno}
                        </h3>
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="text-gray-700 leading-relaxed">
                        {feedback.comentario}
                      </div>
                    </div>
                  ))}
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        type="button"
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                      <span className="text-gray-600">Página {currentPage} de {totalPages}</span>
                      <button
                        type="button"
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitFeedback}
        loading={submitting}
        error={submitError}
      />
    </div>
  );
}
