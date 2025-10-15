import { api } from "./api.js";

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

export default { getMateriaisPorCurso };