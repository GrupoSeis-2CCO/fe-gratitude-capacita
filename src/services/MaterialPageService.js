import { api } from "./api.js";

export async function getMaterialDoCurso(idCurso, idMaterial) {
  if (!idCurso || !idMaterial) {
    console.warn("⚠️ idCurso ou idMaterial está vazio!");
    return null;
  }

  try {
    const resp = await api.get(`/cursos/${idCurso}/materiais/${idMaterial}`);
    if (resp.status === 204 || !resp.data) return null;
    return resp.data;
  } catch (err) {
    console.warn("Single-material endpoint returned error, attempting fallback to list endpoint:", err?.response?.status);
    // If backend doesn't support single-material lookup (404), try fetching the list and find locally
    if (err?.response?.status === 404) {
      try {
        const listResp = await api.get(`/cursos/${idCurso}/materiais`);
        if (listResp.status === 200 && Array.isArray(listResp.data)) {
          const found = listResp.data.find(m => Number(m.id) === Number(idMaterial));
          if (found) return found;
          throw new Error(`Material ${idMaterial} não encontrado no curso ${idCurso} (lista retornada)`);
        }
      } catch (listErr) {
        console.error("Fallback list request failed:", listErr);
        const message = listErr?.response?.data?.message || listErr?.message || "Erro ao buscar lista de materiais.";
        throw new Error(message);
      }
    }

    console.error("Erro ao buscar material do curso:", err);
    const message = err?.response?.data?.message || err?.message || "Erro ao buscar o material.";
    throw new Error(message);
  }
}

export default { getMaterialDoCurso };