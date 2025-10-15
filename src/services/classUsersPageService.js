import { api } from "./api.js";

export async function getParticipantesByCurso(idCurso) {
  if (!idCurso) {
    console.warn("⚠️ idCurso está vazio!");
    return [];
  }

  try {
    console.log(`🔍 Buscando participantes do curso ${idCurso}...`);
    
    const resp = await api.get(`/matriculas/curso/${idCurso}/participantes`);
    
    console.log("✅ Resposta recebida:", resp);
    console.log("📊 Status:", resp.status);
    console.log("📦 Dados:", resp.data);
    
    if (resp.status === 204 || !resp.data) {
      console.warn("⚠️ Nenhum dado retornado (204 ou data vazio)");
      return [];
    }
    
    return resp.data;
  } catch (err) {
    console.error("❌ Erro na requisição:", err);
    console.error("📄 Response:", err?.response);
    console.error("🔢 Status:", err?.response?.status);
    console.error("💬 Mensagem:", err?.response?.data);
    
    if (err?.response?.status === 404) {
      console.warn(`⚠️ Curso ${idCurso} não encontrado ou sem participantes`);
      return [];
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