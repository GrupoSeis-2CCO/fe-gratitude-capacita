import { api } from "./api.js";

export async function getCursosDoUsuario(fkUsuario) {
  if (!fkUsuario) {
    console.warn("⚠️ fkUsuario está vazio!");
    return [];
  }

  try {
    console.log(`🔍 Buscando cursos do usuário ${fkUsuario}...`);
    const resp = await api.get(`/matriculas/usuario/${fkUsuario}/cursos`);
    console.log("✅ Resposta recebida:", resp);
    if (resp.status === 204 || !resp.data) {
      console.warn("⚠️ Nenhum dado retornado (204 ou data vazio)");
      return [];
    }
    return resp.data;
  } catch (err) {
    console.error("❌ Erro na requisição:", err);
    const message = err?.response?.data?.message || err?.message || "Erro ao buscar cursos do usuário.";
    throw new Error(message);
  }
}

export default { getCursosDoUsuario };