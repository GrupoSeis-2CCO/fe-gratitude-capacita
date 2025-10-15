import { api } from "./api.js";

export async function getEngajamentoPorCurso(idCurso, from, to, days) {
  if (!idCurso) {
    console.warn("⚠️ idCurso está vazio!");
    return [];
  }

  try {
    const params = {};
    if (from) params.from = from; // yyyy-MM-dd
    if (to) params.to = to;
    if (days) params.days = days;

    const resp = await api.get(`/relatorios/curso/${idCurso}/engajamento`, { params });
  console.debug('getEngajamentoPorCurso: request params=', params, 'response status=', resp.status, 'data=', resp.data && resp.data.slice ? resp.data.slice(0,10) : resp.data);

    if (resp.status === 204 || !resp.data) return [];

    return resp.data; // array [{date: 'yyyy-MM-dd', value: number}, ...]
  } catch (err) {
    console.error("Erro ao buscar engajamento:", err);
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export default { getEngajamentoPorCurso };
