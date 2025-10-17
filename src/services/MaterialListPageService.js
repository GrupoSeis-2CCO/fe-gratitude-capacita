import { api } from "./api.js";
import { ensureMatricula } from "./MatriculaService.js";

export async function getMateriaisPorCurso(idCurso) {
  if (!idCurso) {
    console.warn("⚠️ idCurso está vazio!");
    return [];
  }

  try {
    console.log(`🔍 Buscando materiais do curso ${idCurso}...`);
    const resp = await api.get(`/cursos/${idCurso}/materiais`);
    console.log("✅ Resposta recebida:", resp);
    if (resp.status === 204 || !resp.data) {
      console.warn("⚠️ Nenhum dado retornado (204 ou data vazio)");
      return [];
    }
    return resp.data;
  } catch (err) {
    console.error("❌ Erro na requisição:", err);
    const message = err?.response?.data?.message || err?.message || "Erro ao buscar os materiais do curso.";
    throw new Error(message);
  }
}

// Conveniência: busca materiais do curso e, se necessário, garante matrícula do usuário atual antes
export async function getMateriaisPorCursoEnsuringMatricula(idCurso) {
  const token = localStorage.getItem('token');
  // extrair id do usuário do localStorage ou JWT
  let uid = null;
  try {
    const raw = localStorage.getItem('usuarioId');
    if (raw) uid = Number(String(raw).trim());
    if (!uid && token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const pId = payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub;
        if (pId != null) uid = Number(pId);
      }
    }
  } catch (_) { /* noop */ }

  try {
    return await getMateriaisPorCurso(idCurso);
  } catch (e) {
    // Se o erro for de matrícula inexistente em chamadas subsequentes, tentaremos criar e refazer uma vez
    const msg = (e?.message || '').toLowerCase();
    if (uid && String(msg).includes('matr')) {
      try { await ensureMatricula(uid, Number(idCurso)); } catch (_) {}
      return await getMateriaisPorCurso(idCurso);
    }
    throw e;
  }
}

export default { getMateriaisPorCurso, getMateriaisPorCursoEnsuringMatricula };