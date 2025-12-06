import { api } from "./api.js";

export async function getParticipantesByCurso(idCurso, { page = 0, size = 10 } = {}) {
  if (!idCurso) {
    console.warn("⚠️ idCurso está vazio!");
    return [];
  }

  try {
    console.log(`Buscando participantes do curso ${idCurso}...`);
    
  const resp = await api.get(`/matriculas/curso/${idCurso}/participantes/paginated`, { params: { page, size } });
    
    if (resp.status === 204 || !resp.data) {
      console.warn("Nenhum participante encontrado");
      return { content: [], page, size, totalElements: 0, totalPages: 0 };
    }
    const d = resp.data;
    if (Array.isArray(d)) {
      return { content: d, page, size, totalElements: d.length, totalPages: Math.ceil(d.length / size) };
    }
    return {
      content: d.content ?? [],
      page: Number(d.page ?? page),
      size: Number(d.size ?? size),
      totalElements: Number(d.totalElements ?? (d.content?.length || 0)),
      totalPages: Number(d.totalPages ?? Math.ceil((d.content?.length || 0) / (d.size || size || 10)))
    };
  } catch (err) {
    console.error("Erro ao buscar participantes");
    
    if (err?.response?.status === 404) {
      console.warn(`Curso ${idCurso} não encontrado ou sem participantes`);
      return { content: [], page, size, totalElements: 0, totalPages: 0 };
    }
    
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Erro ao buscar os participantes do curso.";
    
    throw new Error(message);
  }
}

export default { getParticipantesByCurso };