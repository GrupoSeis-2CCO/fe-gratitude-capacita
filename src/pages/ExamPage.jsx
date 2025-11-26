import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button"; // still used potentially elsewhere
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamTaker from "../components/ExamTaker.jsx";
import ExamPageService from "../services/ExamPageService.js";
import Modal from "../components/Modal";

export default function ExamPage({ examId = 1 }) {
  const navigate = useNavigate();
  const { idCurso } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'warning' });

  useEffect(() => {
    async function fetchExam() {
      setLoading(true);
      setError(null);
      try {
        const data = await ExamPageService.getExamData(examId);
        setQuestions(data);
      } catch (err) {
        setError("Erro ao carregar prova");
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examId]);


  // Estado para mostrar resultado do envio
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Simule um userId fixo para teste
  const userId = 1;

  async function handleSubmit(answers) {
    // Validação: impede envio se nem todas as questões foram respondidas
    if (questions.length === 0) return;
    const answeredCount = Object.keys(answers || {}).length;
    if (answeredCount < questions.length) {
      setModal({
        open: true,
        title: 'Atenção',
        message: 'Responda todas as questões antes de enviar.',
        type: 'warning'
      });
      return;
    }
    // Log payload before sending to backend for easier debugging
    console.debug('[ExamPage] Enviando payload:', { examId, userId, answers });
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await ExamPageService.submitExam(examId, userId, answers);
      console.debug('[ExamPage] Resultado do submit:', result);
      setSubmitResult(result);
    } catch (err) {
      // Mostra mais detalhes vindo do backend quando disponível
      const backendMsg = err?.response?.data || err?.message || 'Erro desconhecido';
      console.error('[ExamPage] Erro ao submeter exame (detalhe):', backendMsg, err);
      setSubmitResult({ error: typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-13 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      {/* BackButton removido - gerenciado pelo Header */}

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <TituloPrincipal>Avaliação</TituloPrincipal>
          </div>
        </div>

        <div className="mt-8 w-full">
          {loading && <div>Carregando...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {submitting && <div>Enviando respostas...</div>}
          {submitResult && submitResult.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {submitResult.error}
            </div>
          )}
          {!loading && !error && !submitting && (
            <ExamTaker questions={questions} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}

