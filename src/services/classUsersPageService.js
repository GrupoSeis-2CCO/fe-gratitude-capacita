import { api } from "./api.js";

export async function getParticipantesByCurso(idCurso, { page = 0, size = 10 } = {}) {
  if (!idCurso) {
    console.warn("⚠️ idCurso está vazio!");
    return [];
  }

  try {
    console.log(`🔍 Buscando participantes do curso ${idCurso}...`);
    
  const resp = await api.get(`/matriculas/curso/${idCurso}/participantes/paginated`, { params: { page, size } });
    
    console.log("✅ Resposta recebida:", resp);
    console.log("📊 Status:", resp.status);
    console.log("📦 Dados:", resp.data);
    
    if (resp.status === 204 || !resp.data) {
      console.warn("⚠️ Nenhum dado retornado (204 ou data vazio)");
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
    console.error("❌ Erro na requisição:", err);
    console.error("📄 Response:", err?.response);
    console.error("🔢 Status:", err?.response?.status);
    console.error("💬 Mensagem:", err?.response?.data);
    
    if (err?.response?.status === 404) {
      console.warn(`⚠️ Curso ${idCurso} não encontrado ou sem participantes`);
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