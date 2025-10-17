import { api } from "./api.js";

/**
 * Ensure there's a matricula (enrollment) for the given user and course.
 * It will POST /matriculas with { fkUsuario, fkCurso } and treat 409 as OK.
 * Returns the created matricula when created, or { existed: true } when it already exists.
 */
// Cache simples para evitar POSTs concorrentes e reduzir 409 ruidosos
const ensureCache = new Map(); // key: `${u}:${c}` => Promise | true

export async function ensureMatricula(fkUsuario, fkCurso) {
  const u = Number(fkUsuario);
  const c = Number(fkCurso);
  if (!u || !c) throw new Error("Parâmetros inválidos para ensureMatricula");
  const key = `${u}:${c}`;
  // Se já confirmado nesta sessão, retorna imediatamente
  if (ensureCache.get(key) === true) return { existed: true, cached: true };
  // Se já houver uma requisição em andamento, reutiliza
  if (ensureCache.get(key) && typeof ensureCache.get(key).then === 'function') {
    return ensureCache.get(key);
  }
  // Não confie em localStorage para evitar POST: crie sempre de forma idempotente (409 tratado como OK)

  const doPost = (async () => {
    try {
      console.debug('[MatriculaService] garantindo matrícula via POST /matriculas', { fkUsuario: u, fkCurso: c });
      const resp = await api.post('/matriculas', { fkUsuario: u, fkCurso: c });
      try { localStorage.setItem(`matricula:ensured:${u}:${c}`, '1'); } catch (_) {}
      ensureCache.set(key, true);
      return resp?.data ?? { created: true };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        // conflito = já existe matrícula -> consideramos ok/idempotente
        try { localStorage.setItem(`matricula:ensured:${u}:${c}`, '1'); } catch (_) {}
        ensureCache.set(key, true);
        return { existed: true };
      }
      // em erro real, limpa o cache para permitir nova tentativa depois
      ensureCache.delete(key);
      throw err;
    }
  })();
  ensureCache.set(key, doPost);
  return doPost;
}

export async function updateUltimoAcesso(fkUsuario, fkCurso) {
  const u = Number(fkUsuario);
  const c = Number(fkCurso);
  if (!u || !c) throw new Error("Parâmetros inválidos para updateUltimoAcesso");
  // Throttle simples por sessão para evitar atualizações concorrentes e erros 1020 do MySQL
  const key = `ultimoAcesso:${u}:${c}`;
  try {
    const last = Number(sessionStorage.getItem(key) || '0');
    const now = Date.now();
    // janela de 15s
    if (last && (now - last) < 15000) {
      return null;
    }
  } catch (_) { /* ignore */ }

  // Memoriza a execução em andamento para evitar duplicidade em renders concorrentes
  if (!updateUltimoAcesso._inflight) updateUltimoAcesso._inflight = new Map();
  const inflightKey = `${u}:${c}`;
  if (updateUltimoAcesso._inflight.has(inflightKey)) {
    return updateUltimoAcesso._inflight.get(inflightKey);
  }

  const run = (async () => {
    try {
      const resp = await api.put(`/matriculas/atualizar-ultimo-acesso/${u}/${c}`);
      try { sessionStorage.setItem(key, String(Date.now())); } catch (_) {}
      return resp?.data ?? null;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || '';
      // Tratar erro de concorrência como benigno e não propagar
      if (msg && /Record has changed since last read/i.test(msg)) {
        try { sessionStorage.setItem(key, String(Date.now())); } catch (_) {}
        return null;
      }
      // uma pequena nova tentativa com jitter em erros transitórios 5xx
      const status = e?.response?.status;
      if (status && status >= 500 && status < 600) {
        try { await new Promise(r => setTimeout(r, 200 + Math.floor(Math.random()*300))); } catch (_) {}
        try {
          const resp2 = await api.put(`/matriculas/atualizar-ultimo-acesso/${u}/${c}`);
          try { sessionStorage.setItem(key, String(Date.now())); } catch (_) {}
          return resp2?.data ?? null;
        } catch (e2) {
          console.debug('[MatriculaService] falha ao atualizar último acesso (retry):', e2?.response?.data || e2?.message);
          return null;
        }
      }
      // não bloquear fluxo por causa disso
      console.debug('[MatriculaService] falha ao atualizar último acesso:', e?.response?.data || e?.message);
      return null;
    } finally {
      updateUltimoAcesso._inflight.delete(inflightKey);
    }
  })();
  updateUltimoAcesso._inflight.set(inflightKey, run);
  return run;
}

// Marca a matrícula como concluída (necessário para permitir envio de feedback)
export async function completarMatricula(fkUsuario, fkCurso) {
  const u = Number(fkUsuario);
  const c = Number(fkCurso);
  if (!u || !c) throw new Error("Parâmetros inválidos para completarMatricula");
  try {
    const resp = await api.put(`/matriculas/completar/${u}/${c}`);
    return resp?.data ?? { completo: true };
  } catch (e) {
    const status = e?.response?.status;
    // Tratar idempotência/erros benignos como OK
    if (status === 409) {
      // caso de conflito tratado como já completo
      return { completo: true, conflict: true };
    }
    // Propaga 404/400 para o chamador decidir
    throw e;
  }
}

export async function getMatriculasPorUsuario(fkUsuario) {
  const u = Number(fkUsuario);
  if (!u) throw new Error("Parâmetro inválido para getMatriculasPorUsuario");
  try {
    const resp = await api.get(`/matriculas/usuario/${u}`);
    return Array.isArray(resp?.data) ? resp.data : [];
  } catch (e) {
    console.debug('[MatriculaService] falha ao listar matrículas do usuário:', e?.response?.data || e?.message);
    return [];
  }
}

const MatriculaService = { ensureMatricula, updateUltimoAcesso, completarMatricula, getMatriculasPorUsuario };
export default MatriculaService;
