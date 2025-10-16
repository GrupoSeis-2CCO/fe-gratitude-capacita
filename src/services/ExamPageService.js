import { api } from "./api.js";

/**
 * Busca dados da prova (exam) do backend para o ExamTaker.
 * Backend retorna: { avaliacao, questoes[] }
 *
 * Transforma para o formato esperado pelo ExamTaker:
 * [
 *   {
 *     id,
 *     text,
 *     alternatives: [ { id, text } ]
 *   }, ...
 * ]
 */

export async function getExamData(examId) {
  if (!examId) throw new Error("Parâmetro examId obrigatório");
  try {
    // Backend espera: /exam/{examId}
    const resp = await api.get(`/exam/${examId}`);
    const raw = resp.data;

    // Mapeamento para o formato esperado pelo ExamTaker
    // Backend: { idAvaliacao, nomeCurso, questoes: [ { idQuestao, enunciado, alternativas: [ { idAlternativa, texto } ] } ] }
    // ExamTaker: [ { id, text, alternatives: [ { id, text } ] } ]
    const questions = (raw.questoes || []).map(q => ({
      id: q.idQuestao,
      text: q.enunciado,
      alternatives: (q.alternativas || []).map(alt => ({
        id: alt.idAlternativa,
        text: alt.texto
      }))
    }));
    return questions;
  } catch (err) {
    console.error('[ExamPageService] Erro ao buscar prova:', err);
    throw err;
  }
}

/**
 * Envia as respostas do usuário para o backend.
 * @param {number} examId
 * @param {number} userId
 * @param {object} answers - { [questionId]: alternativeId }
 * @returns {Promise<any>} resposta do backend
 */
export async function submitExam(examId, userId, answers) {
  if (!examId || !userId || !answers) throw new Error("Parâmetros obrigatórios ausentes");
  try {
    // Exemplo de payload
    const payload = {
      userId,
      answers
    };
    // POST para /exam/{examId}/submit
    const resp = await api.post(`/exam/${examId}/submit`, payload);
    return resp.data;
  } catch (err) {
    console.error('[ExamPageService] Erro ao submeter prova:', err);
    throw err;
  }
}


/**
 * Busca avaliação existente pelo id do curso (para edição)
 * @param {number} idCurso
 * @returns {Promise<any>} dados da avaliação
 */
export async function getExamByCourseId(idCurso) {
  if (!idCurso) throw new Error("Parâmetro idCurso obrigatório");
  try {
    const resp = await api.get(`/avaliacoes/curso/${idCurso}`);
    return resp.data;
  } catch (err) {
    console.error('[ExamPageService] Erro ao buscar avaliação por curso:', err);
    throw err;
  }
}

/**
 * Atualiza avaliação existente pelo id do curso
 * @param {number} idCurso
 * @param {object} updatedExam
 * @returns {Promise<any>} avaliação atualizada
 */
// Atualiza avaliação existente pelo id do curso (usa idAvaliacao do examData)

export async function updateExam(idCurso, updatedExam) {
  if (!idCurso || !updatedExam) throw new Error("Parâmetros obrigatórios ausentes");
  try {
    // Busca avaliação para pegar idAvaliacao
    const avaliacao = await getExamByCourseId(idCurso);
    if (!avaliacao || !avaliacao.idAvaliacao) throw new Error("Avaliação não encontrada para atualização");

    // Monta payload para o novo endpoint
    const payload = {
      acertosMinimos: updatedExam.notaMinima,
      questoes: (updatedExam.questoes || []).map(q => ({
        idQuestao: q.idQuestao,
        enunciado: q.enunciado,
        numeroQuestao: q.numeroQuestao,
        fkAlternativaCorreta: q.fkAlternativaCorreta,
        alternativas: (q.alternativas || []).map(a => ({
          idAlternativa: a.idAlternativa,
          texto: a.texto,
          ordemAlternativa: a.ordemAlternativa
        }))
      }))
    };
    await api.put(`/avaliacoes/${avaliacao.idAvaliacao}`, payload);
    return { success: true };
  } catch (err) {
    console.error('[ExamPageService] Erro ao atualizar avaliação:', err);
    throw err;
  }
}

const ExamPageService = {
  getExamData,
  submitExam,
  getExamByCourseId,
  updateExam
};

export default ExamPageService;
