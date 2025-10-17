import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import { api } from "../services/api.js";

export default function StudentCourseFeedbacksPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const { idCurso } = useParams();
  const idCursoNum = useMemo(() => Number(idCurso), [idCurso]);

  // Apenas colaboradores (2)
  if (!isLoggedIn() || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meuFeedback, setMeuFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const uid = getUserIdFromJwt();
        if (!uid) throw new Error("Usuário não identificado");
  const resp = await api.get(`/feedbacks/curso/${idCursoNum}`);
  const list = Array.isArray(resp.data) ? resp.data : [];
        const mine = list.find(f => Number(f?.usuarioId) === Number(uid));
        if (!mounted) return;
        setMeuFeedback(mine || null);
      } catch (e) {
        if (e?.response?.status === 204) {
          setMeuFeedback(null);
        } else {
          setError(e?.message || "Erro ao carregar seu feedback");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [idCursoNum]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Meu Feedback do Curso</TituloPrincipal>
        </div>
        <div className="mt-8 w-full max-w-3xl mx-auto">
          {loading && <div>Carregando...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {meuFeedback ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-900 font-semibold">{meuFeedback.cursoTitulo ? `Curso: ${meuFeedback.cursoTitulo}` : `Curso ${idCursoNum}`}</div>
                    <div className="text-yellow-500 font-bold">{meuFeedback.estrelas} / 10</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{meuFeedback.anonimo ? 'Enviado como Anônimo' : 'Enviado com identificação'}</div>
                  {meuFeedback.motivo ? (
                    <div className="mt-4 text-gray-800 whitespace-pre-wrap">{meuFeedback.motivo}</div>
                  ) : (
                    <div className="mt-4 text-gray-500">Sem comentário.</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">Você ainda não enviou feedback para este curso.</div>
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
