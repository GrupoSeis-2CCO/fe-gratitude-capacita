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

const MatriculaService = { ensureMatricula };
export default MatriculaService;
