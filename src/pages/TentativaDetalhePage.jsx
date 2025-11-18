import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import ExamViewer from "../components/ExamViewer.jsx";
import AnswerSheetPageService from "../services/AnswerSheetPageService.js";
import { api } from "../services/api.js";

export default function TentativaDetalhePage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const { cursoId, idTentativa } = useParams();

  // Somente colaboradores (2) podem ver seu próprio gabarito; ajuste se quiser permitir outros perfis
  if (!isLoggedIn() || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const tentativaIdNum = useMemo(() => Number(idTentativa), [idTentativa]);
  const cursoIdNum = useMemo(() => Number(cursoId), [cursoId]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumo, setResumo] = useState(null); // { nomeCurso, dtTentativa, notaAcertos, notaTotal, fkAvaliacao }
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [showGabarito, setShowGabarito] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const uid = getUserIdFromJwt();
        if (!uid) throw new Error("Usuário não identificado");

        // 1) Buscar tentativas do usuário e localizar a tentativa alvo
        const resp = await api.get(`/tentativas/usuario/${uid}`);
        const tentativas = Array.isArray(resp.data) ? resp.data : [];
        const alvo = tentativas.find(t => {
          const id = t?.idTentativa ?? t?.id ?? t?.idTentativaComposto?.idTentativa;
          const cId = t?.fkCurso ?? t?.idTentativaComposto?.idMatriculaComposto?.fkCurso;
          return Number(id) === tentativaIdNum && (!cursoIdNum || Number(cId) === cursoIdNum);
        });
        if (!alvo) throw new Error("Tentativa não encontrada para este usuário");

        const resumoLocal = {
          nomeCurso: alvo.nomeCurso || (alvo?.avaliacao?.fkCurso?.tituloCurso) || (alvo?.matricula?.curso?.tituloCurso) || (alvo?.fkCurso ? `Curso ${alvo.fkCurso}` : "Curso"),
          dtTentativa: alvo.dtTentativa || alvo.data || alvo.dt || null,
          notaAcertos: alvo.notaAcertos ?? alvo.acertos ?? null,
          notaTotal: alvo.notaTotal ?? alvo.totalQuestoes ?? null,
          fkAvaliacao: alvo.fkAvaliacao || alvo?.avaliacao?.idAvaliacao || null
        };

        if (!mounted) return;
        setResumo(resumoLocal);

        // 2) Buscar o gabarito usando o mesmo service do AnswerSheetPage
        if (resumoLocal.fkAvaliacao) {
          try {
            const data = await AnswerSheetPageService.getAnswerSheetData(Number(uid), Number(resumoLocal.fkAvaliacao));
            if (!mounted) return;
            setQuestions(data.questions || []);
            setUserAnswers(data.userAnswers || {});
            setCorrectAnswers(data.correctAnswers || {});
          } catch (e) {
            console.warn("Falha ao carregar gabarito da avaliação:", e);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError(e?.message || "Erro ao carregar detalhes da tentativa");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [cursoIdNum, tentativaIdNum]);

  function formatIsoDateTime(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const day = d.getDate();
      let month = d.toLocaleString('pt-BR', { month: 'long' });
      if (month && month.length > 0) month = month.charAt(0).toUpperCase() + month.slice(1);
      const year = d.getFullYear();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} de ${month} de ${year}, ${hours}h${minutes}`;
    } catch (e) {
      return iso;
    }
  }

  function notaText() {
    if (!resumo) return '—';
    const a = resumo.notaAcertos;
    const t = resumo.notaTotal;
    if (a === 0 && t === 0) return 'Sem respostas';
    if (a != null && t != null) return `${a}/${t}`;
    // fallback: calcula comparando userAnswers vs correctAnswers
    try {
      const keys = Object.keys(correctAnswers || {});
      const total = keys.length;
      const acertos = keys.reduce((acc, qid) => acc + (String(userAnswers[qid]) === String(correctAnswers[qid]) ? 1 : 0), 0);
      if (total > 0) return `${acertos}/${total}`;
    } catch {}
    return '—';
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Detalhes da Tentativa</TituloPrincipal>
        </div>

        <div className="mt-8 w-full">
          {loading && <div>Carregando...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && resumo && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
                  <div><span className="font-semibold">Curso:</span> {resumo.nomeCurso}</div>
                  <div><span className="font-semibold">Data:</span> {formatIsoDateTime(resumo.dtTentativa)}</div>
                  <div><span className="font-semibold">Nota:</span> {notaText()}</div>
                  <div><span className="font-semibold">Avaliação:</span> {resumo.fkAvaliacao ?? '—'}</div>
                </div>
                {resumo.fkAvaliacao && (
                  <div className="mt-6">
                    <button
                      className="px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setShowGabarito(v => !v)}
                    >
                      {showGabarito ? 'Ocultar Gabarito' : 'Ver Gabarito'}
                    </button>
                  </div>
                )}
              </div>

              {showGabarito && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  {questions.length === 0 ? (
                    <div className="text-gray-600">Gabarito indisponível.</div>
                  ) : (
                    <ExamViewer questions={questions} userAnswers={userAnswers} correctAnswers={correctAnswers} />
                  )}
                </div>
              )}
            </div>
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
