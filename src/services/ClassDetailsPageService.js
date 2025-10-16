import { api } from "./api.js";

function normalizeError(err, fallbackMessage) {
  const responseMessage = err?.response?.data?.message || err?.response?.data;
  if (responseMessage && typeof responseMessage === "string") {
    return responseMessage;
  }
  return err?.message || fallbackMessage;
}

export async function getCursoDetalhes(idCurso) {
  if (!idCurso) {
    console.warn("idCurso vazio!");
    return null;
  }
  try {
    const resp = await api.get(`/cursos/${idCurso}/detalhes`);
    if (resp.status === 204 || !resp.data) return null;
    return resp.data;
  } catch (err) {
    const message = normalizeError(err, "Erro ao buscar detalhes do curso.");
    console.error("Erro ao buscar detalhes do curso:", message, err);
    throw new Error(message);
  }
}

export async function getMateriaisCount(idCurso) {
  try {
    const resp = await api.get(`/cursos/${idCurso}/materiais`);
    if (resp.status === 204 || !Array.isArray(resp.data)) return 0;
    return resp.data.length;
  } catch (err) {
    console.warn("Falha ao buscar materiais para contagem, retornando 0", err);
    return 0;
  }
}

export default { getCursoDetalhes, getMateriaisCount };
