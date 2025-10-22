import { api } from "./api.js";

export async function getFeedbacksByCurso(idCurso, { page, size } = {}) {
  if (!idCurso) return { content: [], page: 0, size: size ?? 10, totalElements: 0, totalPages: 0 };
  try {
    let resp;
    if (page != null && size != null) {
      resp = await api.get(`/feedbacks/curso/${idCurso}/paginated`, { params: { page, size } });
    } else {
      resp = await api.get(`/feedbacks/curso/${idCurso}`);
    }
    if (resp.status === 204) return { content: [], page: page ?? 0, size: size ?? 10, totalElements: 0, totalPages: 0 };
    const d = resp.data;
    if (Array.isArray(d)) {
      // wrap
  const s = (size ?? d.length) || 10;
      return { content: d, page: page ?? 0, size: s, totalElements: d.length, totalPages: Math.ceil(d.length / s) };
    }
    return {
      content: d.content ?? d ?? [],
      page: Number(d.page ?? page ?? 0),
      size: Number(d.size ?? size ?? 10),
      totalElements: Number(d.totalElements ?? (Array.isArray(d) ? d.length : (d.content?.length || 0))),
      totalPages: Number(d.totalPages ?? Math.ceil(((Array.isArray(d) ? d.length : (d.content?.length || 0)) / (d.size || size || 10))))
    };
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