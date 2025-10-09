import { api } from "./api.js";

export async function getFeedbacksByCurso(idCurso) {
  if (!idCurso) return [];
  try {
    const resp = await api.get(`/feedbacks/curso/${idCurso}`);
    if (resp.status === 204) return [];
    return resp.data ?? [];
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Erro na requisição";
    throw new Error(message);
  }
}

export default { getFeedbacksByCurso };