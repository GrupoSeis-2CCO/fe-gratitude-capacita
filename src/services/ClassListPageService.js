import { api } from "./api.js";

function normalizeError(err, fallbackMessage) {
  const responseMessage = err?.response?.data?.message || err?.response?.data;
  if (responseMessage && typeof responseMessage === "string") {
    return responseMessage;
  }
  return err?.message || fallbackMessage;
}

export async function getCourses() {
  try {
    const resp = await api.get("/cursos");
    if (resp.status === 204 || !resp.data) {
      return [];
    }
    return resp.data;
  } catch (err) {
    const message = normalizeError(err, "Erro ao buscar os cursos.");
    console.error("❌ Erro ao buscar cursos:", message, err);
    throw new Error(message);
  }
}

export async function createCourse(courseInput) {
  if (!courseInput || !courseInput.tituloCurso) {
    throw new Error("Título do curso é obrigatório.");
  }

  // Se courseInput.file existir, envia como multipart
  if (courseInput.file instanceof File) {
    const form = new FormData();
    form.append('tituloCurso', courseInput.tituloCurso);
    if (typeof courseInput.descricao === 'string' && courseInput.descricao.trim() !== '') form.append('descricao', courseInput.descricao.trim());
    if (typeof courseInput.duracaoEstimada === 'number') form.append('duracaoEstimada', courseInput.duracaoEstimada);
    form.append('imagem', courseInput.file); // campo do arquivo
    try {
      const resp = await api.post("/cursos", form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return resp.data;
    } catch (err) {
      const message = normalizeError(err, "Erro ao criar o curso.");
      console.error("❌ Erro ao criar curso (multipart):", message, err);
      throw new Error(message);
    }
  } else {
    // Fallback: sem imagem ou só URL
    const payload = { tituloCurso: courseInput.tituloCurso };
    if (typeof courseInput.descricao === 'string' && courseInput.descricao.trim() !== '') payload.descricao = courseInput.descricao.trim();
    if (typeof courseInput.imagem === 'string' && courseInput.imagem.trim() !== '') payload.imagem = courseInput.imagem.trim();
    if (typeof courseInput.duracaoEstimada === 'number') payload.duracaoEstimada = courseInput.duracaoEstimada;
    try {
      const resp = await api.post("/cursos", payload);
      return resp.data;
    } catch (err) {
      const message = normalizeError(err, "Erro ao criar o curso.");
      console.error("❌ Erro ao criar curso:", message, err);
      throw new Error(message);
    }
  }
}

export async function updateCourse(idCurso, updates) {
  if (!idCurso) throw new Error("idCurso é obrigatório para atualizar.");
  const payload = {};
  if (typeof updates?.tituloCurso === 'string' && updates.tituloCurso.trim() !== '') payload.tituloCurso = updates.tituloCurso.trim();
  if (typeof updates?.descricao === 'string' && updates.descricao.trim() !== '') payload.descricao = updates.descricao.trim();
  if (typeof updates?.imagem === 'string' && updates.imagem.trim() !== '') payload.imagem = updates.imagem.trim();
  if (typeof updates?.duracaoEstimada === 'number') payload.duracaoEstimada = updates.duracaoEstimada;
  try {
    const resp = await api.put(`/cursos/${idCurso}`, payload);
    return resp.data;
  } catch (err) {
    const message = normalizeError(err, "Erro ao atualizar o curso.");
    console.error("❌ Erro ao atualizar curso:", message, err);
    throw new Error(message);
  }
}

export async function deleteCourse(idCurso) {
  if (!idCurso) throw new Error("idCurso é obrigatório para excluir.");
  try {
    const resp = await api.delete(`/cursos/${idCurso}`);
    return resp.status === 200 || resp.status === 204;
  } catch (err) {
    const status = err?.response?.status;
    let message = normalizeError(err, "Erro ao excluir o curso.");
    if (status === 409) {
      // Prefer backend provided message if any; otherwise, show a friendly explanation
      const backendMsg = err?.response?.data?.message || err?.response?.data;
      message = typeof backendMsg === 'string' && backendMsg.trim()
        ? backendMsg
        : 'Não é possível excluir: o curso possui dependências (materiais, avaliações ou matrículas).';
    }
    console.error("❌ Erro ao excluir curso:", message, err);
    throw new Error(message);
  }
}

export async function toggleCourseHidden(idCurso) {
  if (!idCurso) throw new Error("idCurso é obrigatório para atualizar visibilidade.");
  try {
    const resp = await api.put(`/cursos/atualizarOculto/${idCurso}`);
    return resp.data;
  } catch (err) {
    const message = normalizeError(err, "Erro ao atualizar visibilidade do curso.");
    console.error("❌ Erro ao atualizar visibilidade:", message, err);
    throw new Error(message);
  }
}

export async function reorderCourses(list) {
  if (!Array.isArray(list)) throw new Error('Lista inválida para reordenar.');
  const payload = list.map(item => ({ idCurso: item.idCurso || item.id, ordemCurso: item.ordemCurso || item.ordem || item.order }));
  try {
    const resp = await api.put('/cursos/reordenar', payload);
    return resp.data;
  } catch (err) {
    const message = normalizeError(err, 'Erro ao reordenar cursos.');
    console.error('❌ Erro ao reordenar cursos:', message, err);
    throw new Error(message);
  }
}

export default {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseHidden,
  reorderCourses,
};
