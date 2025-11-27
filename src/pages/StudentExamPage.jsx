import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamTaker from "../components/ExamTaker.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ExamPageService from "../services/ExamPageService.js";
import { api } from "../services/api.js";
import { completarMatricula } from "../services/MatriculaService.js";

// Página para colaboradores (usuários tipo 2) realizarem a avaliação de um curso
export default function StudentExamPage() {
  const navigate = useNavigate();
  const { idCurso, idAvaliacao } = useParams();
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();

  // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
  if (!isLoggedIn() || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState(null); // idAvaliacao usado para submit
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAllQuestionsModal, setShowAllQuestionsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStars, setFeedbackStars] = useState(0); // 0..5 (seleção de 1 a 5)
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackAnonimo, setFeedbackAnonimo] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchExam() {
      setLoading(true);
      setError(null);
      try {
        // Prioriza pegar por idAvaliacao se vier pela rota; senão tenta via idCurso
        if (idAvaliacao) {
          const q = await ExamPageService.getExamData(Number(idAvaliacao));
          if (!mounted) return;
          setQuestions(q || []);
          setExamId(Number(idAvaliacao));
        } else if (idCurso) {
          const avaliacao = await ExamPageService.getExamByCourseId(Number(idCurso));
          if (!mounted) return;
          const qs = (avaliacao?.questoes || []).map((q) => ({
            id: q.idQuestao,
            text: q.enunciado,
            alternatives: (q.alternativas || []).map((a) => ({ id: a.idAlternativa, text: a.texto }))
          }));
          setQuestions(qs);
          setExamId(avaliacao?.idAvaliacao || null);
          setCourseName(avaliacao?.nomeCurso || "");
        } else {
          throw new Error("Identificador de avaliação ausente (idAvaliacao ou idCurso)");
        }
      } catch (err) {
        console.error("Erro ao carregar avaliação:", err);
        if (!mounted) return;
        setError("Erro ao carregar avaliação");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchExam();
    return () => { mounted = false };
  }, [idCurso, idAvaliacao]);

  async function handleSubmit(answers) {
    if (questions.length === 0 || !examId) return;
    const answeredCount = Object.keys(answers || {}).length;
    if (answeredCount < questions.length) {
      // Exibir modal de aviso utilizando nosso componente de confirmação
      setShowAllQuestionsModal(true);
      return;
    }

    const uid = getUserIdFromJwt() || 1; // fallback 1 para testes
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await ExamPageService.submitExam(Number(examId), Number(uid), answers);
      setSubmitResult(result || { success: true });
      // Abrir modal de feedback após concluir a avaliação
      setShowFeedbackModal(true);
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      setSubmitResult({ error: "Erro ao enviar respostas" });
    } finally {
      setSubmitting(false);
    }
  }

  const title = courseName
    ? `Avaliação de conhecimento do ${courseName}`
    : "Avaliação de conhecimento";

  async function submitFeedback() {
    try {
      setFeedbackError(null);
      const uid = getUserIdFromJwt();
      if (!uid) throw new Error("Usuário não identificado");
      if (!idCurso) throw new Error("Curso não identificado");
      // Garante matrícula concluída antes de permitir feedback (backend exige completo=true)
      try {
        await completarMatricula(Number(uid), Number(idCurso));
      } catch (e) {
        // Se 404/400, vamos tentar mesmo assim e deixar o backend responder (mas logamos)
        console.debug('Não foi possível marcar matrícula como completa antes do feedback:', e?.response?.data || e?.message);
      }
  // feedbackStars deve estar no intervalo 1..5
  const estrelasInt = Math.max(1, Math.min(5, Math.round(feedbackStars || 0)));

      const payload = {
        idCurso: Number(idCurso),
        estrelas: estrelasInt,
        motivo: feedbackComment || null,
        fkUsuario: Number(uid),
        anonimo: Boolean(feedbackAnonimo)
      };
      await api.post('/feedbacks', payload);
      setShowFeedbackModal(false);
      if (idCurso) setTimeout(() => navigate(`/cursos/${idCurso}/material`), 200);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        // Tenta marcar matrícula como completa e reenviar uma vez
        try {
          const uid = getUserIdFromJwt();
          await completarMatricula(Number(uid), Number(idCurso));
          const estrelasInt = Math.max(1, Math.min(5, Math.round(feedbackStars || 0)));
          await api.post('/feedbacks', {
            idCurso: Number(idCurso),
            motivo: feedbackComment || null,
            fkUsuario: Number(uid),
            anonimo: Boolean(feedbackAnonimo)
          });
          setShowFeedbackModal(false);
          if (idCurso) setTimeout(() => navigate(`/cursos/${idCurso}/material`), 200);
        } catch (retryErr) {
          console.error('Falha ao reenviar feedback após completar matrícula:', retryErr);
          setFeedbackError(retryErr?.response?.data?.message || retryErr?.message || 'Falha ao reenviar feedback.');
        }
      } else if (status === 400) {
        // Bad request - validação do backend (ex.: estrelas fora do intervalo)
        setFeedbackError(e?.response?.data?.message || e?.message || 'Requisição inválida ao enviar feedback.');
      
      } else {
        console.error('Erro ao enviar feedback:', e);
        setFeedbackError(e?.response?.data?.message || e?.message || 'Erro ao enviar feedback.');
      }
      // Em caso de erro, mantém o modal aberto para o usuário ajustar
    }
  }

  return (
    <>
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-2 sm:px-8 pt-6 sm:pt-13 pb-10 sm:pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center w-full">
              <TituloPrincipal>{title}</TituloPrincipal>
            </div>
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
          {/* Modal para obrigatoriedade de responder todas as questões */}
          <ConfirmModal
            open={showAllQuestionsModal}
            title="Atenção"
            message="Responda todas as questões antes de enviar."
            confirmLabel="OK"
            hideCancel={true}
            onConfirm={() => setShowAllQuestionsModal(false)}
            onCancel={() => setShowAllQuestionsModal(false)}
          />
          {!loading && !error && !submitting && (
            <ExamTaker questions={questions} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
    {showFeedbackModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Deixe seu feedback do curso</h2>
          <p className="text-base text-gray-700 mb-4">Qual nota você daria para a aula? (1 = Ruim e 5 = Excelente)</p>
          {feedbackError && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {feedbackError}
            </div>
          )}

          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Ruim</span>
              <span>Excelente</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => {
                const active = i < feedbackStars;
                const value = i + 1; // 1..5
                return (
                  <button
                    key={i}
                    type="button"
                    className={`h-10 rounded-md border text-sm font-semibold transition-colors ${active ? 'bg-yellow-400 border-yellow-500 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => setFeedbackStars(value)}
                    aria-label={`Selecionar ${value} de 5`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Selecionado: {feedbackStars} / 5</span>
              <span className="text-base sm:text-lg font-semibold text-gray-800">{feedbackStars} / 5</span>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deixe um comentário sobre sua experiência:</label>
          <textarea
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            rows={5}
            maxLength={1000}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Escreva aqui..."
          />
          <div className="text-right text-xs text-gray-500 mb-3">{feedbackComment.length}/1000</div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-gray-700">Deseja que esse feedback seja anônimo?</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="radio" name="anonimo" checked={feedbackAnonimo === true} onChange={() => setFeedbackAnonimo(true)} />
                Sim
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="radio" name="anonimo" checked={feedbackAnonimo === false} onChange={() => setFeedbackAnonimo(false)} />
                Não
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="px-5 py-2.5 rounded-md border text-gray-700 cursor-pointer" onClick={() => { setShowFeedbackModal(false); if (idCurso) navigate(`/cursos/${idCurso}/material`); }}>Pular</button>
            <button className="px-5 py-2.5 rounded-md bg-blue-600 text-white cursor-pointer" onClick={submitFeedback}>Enviar</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Utilitário: tenta obter o userId de um JWT no localStorage
function getUserIdFromJwt() {
  try {
    const possibleKeys = ["token", "authToken", "accessToken", "jwt", "Authorization", "auth"]; 
    let token = null;
    for (const k of possibleKeys) {
      const v = localStorage.getItem(k);
      if (v) { token = v; break; }
    }
    if (!token) {
      const root = localStorage.getItem('persist:root');
      if (root) {
        try {
          const parsed = JSON.parse(root);
          for (const key of Object.keys(parsed)) {
            const val = parsed[key];
            try {
              const p = JSON.parse(val);
              if (p && (p.token || p.accessToken || p.jwt)) { token = p.token || p.accessToken || p.jwt; break; }
            } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore */ }
      }
    }
    if (!token) return null;
    if (token.startsWith('Bearer ')) token = token.slice(7);
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    if (!payload) return null;

    const tryFromUserObj = (p) => {
      if (!p || typeof p !== 'object') return null;
      return p.id || p.userId || p.user_id || p.usuarioId || p.usuario_id || null;
    };

    return (
      payload.id ||
      payload.sub ||
      payload.userId ||
      payload.user_id ||
      payload.usuarioId ||
      payload.usuario_id ||
      payload.usuario ||
      payload.user ||
      tryFromUserObj(payload.user) ||
      tryFromUserObj(payload.usuario) ||
      null
    );
  } catch (e) {
    console.warn('Falha ao decodificar JWT para extrair id:', e);
    return null;
  }
}


