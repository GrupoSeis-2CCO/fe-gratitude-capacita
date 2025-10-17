import { api } from "./api.js";

// tipo: 'video' | 'apostila' (or 'pdf' which will be normalized to 'apostila')
export async function getMaterialDoCurso(idCurso, idMaterial, tipo) {
  if (!idCurso || !idMaterial) {
    console.warn("⚠️ idCurso ou idMaterial está vazio!");
    return null;
  }

  try {
    const desiredType = (tipo || '').toString().toLowerCase() === 'pdf' ? 'apostila' : (tipo || '').toString().toLowerCase();
    const resp = await api.get(`/cursos/${idCurso}/materiais/${idMaterial}`);
    if (resp.status === 204 || !resp.data) return null;
    const data = resp.data;
    // If tipo was provided and does not match the backend result, fall back to list-based match
    if (desiredType && (String(data?.tipo).toLowerCase() !== desiredType)) {
      throw { response: { status: 404, data: { message: 'Type mismatch on single-material endpoint, falling back to list' } } };
    }
    return data;
  } catch (err) {
    console.warn("Single-material endpoint returned error, attempting fallback to list endpoint:", err?.response?.status);
    // If backend doesn't support single-material lookup (404), try fetching the list and find locally
    if (err?.response?.status === 404) {
      try {
        const listResp = await api.get(`/cursos/${idCurso}/materiais`);
        if (listResp.status === 200 && Array.isArray(listResp.data)) {
          const desiredType = (tipo || '').toString().toLowerCase() === 'pdf' ? 'apostila' : (tipo || '').toString().toLowerCase();
          const found = listResp.data.find(m => {
            const mid = Number(m.id);
            const mtype = String(m.tipo || m.type || '').toLowerCase();
            if (desiredType) return mid === Number(idMaterial) && mtype === desiredType;
            return mid === Number(idMaterial);
          });
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