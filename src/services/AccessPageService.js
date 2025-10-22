import { api } from "./api.js";

function normalizeError(err, fallbackMessage) {
  const responseMessage = err?.response?.data?.message || err?.response?.data;
  if (responseMessage && typeof responseMessage === "string") {
    return responseMessage;
  }
  return err?.message || fallbackMessage;
}

export async function listarCursos() {
  try {
    const resp = await api.get(`/cursos`);
    if (resp.status === 204 || !Array.isArray(resp.data)) return [];
    // backend returns CursoResponse list
    return resp.data;
  } catch (err) {
    const msg = normalizeError(err, "Erro ao listar cursos");
    throw new Error(msg);
  }
}

export async function listarParticipantesPorCurso(idCurso, { page = 0, size = 10 } = {}) {
  if (!idCurso) return { content: [], page: 0, size, totalElements: 0, totalPages: 0 };
  try {
    const resp = await api.get(`/matriculas/curso/${idCurso}/participantes/paginated`, { params: { page, size } });
    if (resp.status === 204 || !resp.data) {
      return { content: [], page, size, totalElements: 0, totalPages: 0 };
    }
    // Backend returns PagedResponse
    const d = resp.data;
    if (Array.isArray(d)) {
      // backward-compat: if server returns array, wrap it
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
    const msg = normalizeError(err, "Erro ao listar participantes do curso");
    throw new Error(msg);
  }
}

// registra acesso geral ao curso para o usuário corrente (servidor já deve derivar via token quando possível)
export async function registrarAcessoCurso(fkUsuario, fkCurso) {
  try {
    if (!fkUsuario || !fkCurso) return null;
    const resp = await api.put(`/matriculas/atualizar-ultimo-acesso/${fkUsuario}/${fkCurso}`);
    return resp?.data ?? null;
  } catch (err) {
    // não bloqueia UX por isso
    console.debug("Falha ao registrar acesso do curso:", err?.response?.data || err?.message);
    return null;
  }
}

export async function registrarAcessoGeral(fkUsuario) {
  try {
    if (!fkUsuario) return null;
    const resp = await api.post(`/acessos/usuario/${fkUsuario}`);
    return resp?.data ?? null;
  } catch (err) {
    console.debug("Falha ao registrar acesso geral:", err?.response?.data || err?.message);
    return null;
  }
}

export default { listarCursos, listarParticipantesPorCurso, registrarAcessoCurso, registrarAcessoGeral };
