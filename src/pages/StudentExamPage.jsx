import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamTaker from "../components/ExamTaker.jsx";
import ExamPageService from "../services/ExamPageService.js";

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
      setSubmitResult({ error: "Responda todas as questões antes de enviar." });
      return;
    }

    const uid = getUserIdFromJwt() || 1; // fallback 1 para testes
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await ExamPageService.submitExam(Number(examId), Number(uid), answers);
      setSubmitResult(result || { success: true });
      // Opcional: redirecionar de volta à lista de materiais do curso após sucesso
      if (idCurso) {
        // Pequeno delay para o usuário ver o sucesso antes do redirect
        setTimeout(() => navigate(`/cursos/${idCurso}/material`), 1200);
      }
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

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>{title}</TituloPrincipal>
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
    </div>
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
