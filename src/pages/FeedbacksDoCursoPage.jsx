import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import { api } from "../services/api.js";

export default function FeedbacksDoCursoPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const { idCurso } = useParams();
  const idCursoNum = useMemo(() => Number(idCurso), [idCurso]);

  // Permitir acesso para admins (1) e professores (3) também, ajuste conforme sua regra.
  if (!isLoggedIn() || (userType !== 1 && userType !== 3 && userType !== 2)) {
    return <Navigate to="/login" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [cursoTitulo, setCursoTitulo] = useState(null);
  const [info, setInfo] = useState(null);
  // Estado do formulário "meu feedback"
  const uid = useMemo(() => getUserIdFromJwt(), []);
  const [meuEstrelas, setMeuEstrelas] = useState(10);
  const [meuMotivo, setMeuMotivo] = useState("");
  const [meuAnonimo, setMeuAnonimo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/feedbacks/curso/${idCursoNum}`);
      const list = Array.isArray(resp.data) ? resp.data : [];

      // Prefill do meu feedback (se existir), usando a lista completa
      if (uid) {
        const myRow = list.find(f => Number(f?.usuarioId) === Number(uid));
        if (myRow) {
          const estrelas = Number(myRow.estrelas) || 10;
          // Clamp para 1..10
          setMeuEstrelas(Math.max(1, Math.min(10, estrelas)));
          setMeuMotivo(myRow.motivo || "");
          setMeuAnonimo(Boolean(myRow.anonimo));
        } else {
          // Valores padrão quando ainda não existe feedback
          setMeuEstrelas(10);
          setMeuMotivo("");
          setMeuAnonimo(false);
        }
      }

      // Regra: Admin (1) e Professor (3) visualizam todos; Colaborador (2) vê apenas os seus
      let rows = list;
      setInfo(null);
      if (userType === 2) {
        if (!uid) throw new Error("Usuário não identificado");
        const hasUsuarioId = list.some(f => f && (f.usuarioId !== undefined && f.usuarioId !== null));
        if (hasUsuarioId) {
          rows = list.filter(f => Number(f?.usuarioId) === Number(uid));
        } else {
          const myName = getUserNameFromStorage();
          const myEmail = getUserEmailFromJwt();
          const norm = s => (s || '').toString().trim().toLowerCase();
          const byName = myName ? list.filter(f => norm(f?.aluno) === norm(myName)) : [];
          const byEmail = myEmail ? list.filter(f => norm(f?.email) === norm(myEmail)) : [];
          rows = byName.length > 0 ? byName : (byEmail.length > 0 ? byEmail : list);
          if (rows === list) {
            setInfo('Filtro por usuário indisponível na resposta do servidor; exibindo todos os feedbacks do curso.');
          }
        }
      }

      setFeedbacks(rows);
      const any = rows.length > 0 ? rows : list;
      if (any && any.length > 0) setCursoTitulo(any[0].cursoTitulo || null);
    } catch (e) {
      if (e?.response?.status === 204) {
        setFeedbacks([]);
      } else {
        setError(e?.message || "Erro ao carregar feedbacks do curso");
      }
    } finally {
      setLoading(false);
    }
  }, [idCursoNum, uid, userType]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadData();
      if (!mounted) return;
    })();
    return () => { mounted = false };
  }, [loadData]);

  async function handleSubmitMeuFeedback(e) {
    e?.preventDefault?.();
    setSaveError(null);
    if (!uid) {
      setSaveError("Usuário não identificado");
      return;
    }
    setSaving(true);
    try {
      // Best-effort: garantir matrícula antes de salvar
      try {
        await api.put(`/matriculas/completar/${uid}/${idCursoNum}`);
      } catch (_) { /* ignora erros de matrícula aqui */ }

      const payload = {
        fkCurso: idCursoNum,
        fkUsuario: uid,
        estrelas: Number(meuEstrelas),
        motivo: (meuMotivo || "").trim() || null,
        anonimo: Boolean(meuAnonimo),
      };
      try {
        await api.post('/feedbacks', payload);
      } catch (err) {
        // Fallback p/ bancos legados: clamp 1–5 se 400
        if (err?.response?.status === 400) {
          const clamped = Math.max(1, Math.min(5, Number(meuEstrelas)));
          await api.post('/feedbacks', { ...payload, estrelas: clamped });
        } else {
          throw err;
        }
      }
      await loadData();
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || 'Falha ao salvar seu feedback');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Feedbacks do Curso {cursoTitulo ? `- ${cursoTitulo}` : ''}</TituloPrincipal>
        </div>
        <div className="mt-8 w-full">
          {userType === 2 && (
            <div className="max-w-4xl mx-auto mb-8 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-900 font-semibold">Seu feedback sobre este curso</div>
                <div className="text-gray-500 text-sm">Apenas 1 feedback por curso. Salvar novamente substitui o anterior.</div>
              </div>

              <form onSubmit={handleSubmitMeuFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estrelas (1 a 10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={meuEstrelas}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v)) return;
                      setMeuEstrelas(Math.max(1, Math.min(10, v)));
                    }}
                    className="w-28 border rounded px-3 py-2"
                  />
                  <span className="ml-2 text-yellow-600 font-semibold">{meuEstrelas} / 10</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentário (opcional)</label>
                  <textarea
                    rows={3}
                    value={meuMotivo}
                    onChange={e => setMeuMotivo(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Compartilhe um pouco sobre sua experiência"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="anonimo"
                    type="checkbox"
                    checked={meuAnonimo}
                    onChange={e => setMeuAnonimo(e.target.checked)}
                  />
                  <label htmlFor="anonimo" className="text-sm text-gray-700">Enviar como anônimo</label>
                </div>

                {saveError && <div className="text-red-600 text-sm">{saveError}</div>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {saving ? 'Salvando...' : 'Salvar meu feedback'}
                  </button>
                </div>
              </form>
            </div>
          )}
          {loading && <div>Carregando...</div>}
          {!loading && info && <div className="text-amber-600 mb-4">{info}</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && (
            <div className="max-w-4xl mx-auto space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-gray-600">Nenhum feedback encontrado.</div>
              ) : feedbacks.map((f, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-900 font-semibold">{f.anonimo ? 'Anônimo' : (f.aluno || 'Aluno')}</div>
                    <div className="text-yellow-500 font-bold">{f.estrelas} / 10</div>
                  </div>
                  {f.motivo ? (
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">{f.motivo}</div>
                  ) : null}
                </div>
              ))}
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

// Utilitário: tenta obter o nome do usuário salvo ao logar (se o app guardar)
function getUserNameFromStorage() {
  try {
    const possible = ["user", "usuario", "currentUser", "profile", "nome", "name"]; 
    for (const key of possible) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj && (obj.nome || obj.name)) return obj.nome || obj.name;
      } catch (_) {
        // se não for JSON, pode ser string simples com nome
        if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim();
      }
    }
    // fallback: alguns apps guardam o último login completo
    const login = localStorage.getItem('loginResponse');
    if (login) {
      try {
        const l = JSON.parse(login);
        if (l && (l.nome || l.name)) return l.nome || l.name;
      } catch (_) { /* ignore */ }
    }
    return null;
  } catch (_) {
    return null;
  }
}

// Utilitário: extrai o email do JWT
function getUserEmailFromJwt() {
  try {
    const possibleKeys = ["token", "authToken", "accessToken", "jwt", "Authorization", "auth"]; 
    let token = null;
    for (const k of possibleKeys) {
      const v = localStorage.getItem(k);
      if (v) { token = v; break; }
    }
    if (!token) return null;
    if (token.startsWith('Bearer ')) token = token.slice(7);
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    return payload?.email || payload?.sub || null;
  } catch (_) {
    return null;
  }
}
