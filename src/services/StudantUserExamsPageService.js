import { api } from "./api.js";

// Helper: try to extract current user id from localStorage/JWT when not provided
function getUserIdFromLocalStorageOrJwt() {
  try {
    const direct = localStorage.getItem("usuarioId");
    if (direct) {
      const n = Number(String(direct).trim());
      if (!Number.isNaN(n)) return n;
    }
    let token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwt") || localStorage.getItem("accessToken");
    if (!token) return null;
    if (token.startsWith("Bearer ")) token = token.slice(7);
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const pId = payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub;
      const uid = Number(pId);
      if (!Number.isNaN(uid)) return uid;
    }
  } catch (_) { /* noop */ }
  return null;
}

export function formatIsoDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    let month = d.toLocaleString("pt-BR", { month: "long" });
    if (month && month.length > 0) month = month.charAt(0).toUpperCase() + month.slice(1);
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} de ${month} de ${year}, ${hours}h${minutes}`;
  } catch (e) {
    return iso;
  }
}

// Raw fetch: returns the DTOs from backend
export async function getTentativasPorUsuarioRaw(fkUsuario) {
  if (!fkUsuario) {
    console.warn("getTentativasPorUsuarioRaw chamado sem fkUsuario");
    return [];
  }
  try {
    const resp = await api.get(`/tentativas/usuario/${encodeURIComponent(String(fkUsuario).trim())}`);
    if (resp.status === 204) return [];
    const data = resp.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.sample)) return data.sample;
    return data ? [data] : [];
  } catch (e) {
    console.error("Erro ao buscar tentativas por usuário:", e);
    if (e?.response?.status === 404) return [];
    throw e;
  }
}

// Mapped fetch: maps to table rows { id, cursoId, curso, data, nota }
export async function getTentativasTableData(fkUsuario) {
  let uid = fkUsuario;
  if (!uid) uid = getUserIdFromLocalStorageOrJwt();
  if (!uid) throw new Error("Usuário não identificado. Faça login novamente.");

  const tentativas = await getTentativasPorUsuarioRaw(uid);
  const rows = (tentativas || []).map((t, idx) => {
    const idTentativa = t?.idTentativa ?? t?.id ?? t?.idTentativaComposto?.idTentativa ?? idx;
    const cursoId = t?.fkCurso ?? t?.avaliacao?.fkCurso?.idCurso ?? t?.matricula?.curso?.idCurso ?? null;
    const curso = t?.nomeCurso || (cursoId != null ? `Curso ${cursoId}` : "Curso");
    const dtRaw = t?.dtTentativa || t?.data || t?.dt || null;
    const data = formatIsoDateTime(dtRaw);
    const acertos = t?.notaAcertos ?? t?.nota_acertos ?? t?.acertos ?? null;
    let total = t?.notaTotal ?? t?.nota_total ?? t?.totalQuestoes ?? null;
    if (total == null) total = t?.avaliacao?.totalQuestoes ?? t?.avaliacao?.qtdQuestoes ?? t?.avaliacao?.numeroQuestoes ?? null;
    let nota = "—";
    if (acertos != null && total != null) {
      nota = `${acertos}/${total}`;
      if (acertos === 0 && total === 0) nota = "Sem respostas";
    }
    return { id: idTentativa, cursoId, curso, data, nota, dtRaw };
  });

  // Ordenar por data mais recente (quando disponível)
  rows.sort((a, b) => {
    const da = a.dtRaw ? new Date(a.dtRaw).getTime() : 0;
    const db = b.dtRaw ? new Date(b.dtRaw).getTime() : 0;
    return db - da;
  });

  return rows;
}

export default { getTentativasPorUsuarioRaw, getTentativasTableData, formatIsoDateTime };
