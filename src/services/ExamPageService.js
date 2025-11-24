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
    const questions = (raw.questoes || []).map(q => {
      // Algumas respostas de backend antigos podem trazer 'alternativa' singular ou outro campo
      const rawAlternatives = q.alternativas || q.alternativa || [];
      const mapped = Array.isArray(rawAlternatives)
        ? rawAlternatives.map(alt => ({
            id: alt.idAlternativa ?? alt.id ?? alt.ordemAlternativa ?? null,
            text: alt.texto ?? alt.text ?? ''
          }))
        : [];
      return {
        id: q.idQuestao ?? q.id ?? null,
        text: q.enunciado ?? q.text ?? '',
        alternatives: mapped
      };
    });

    // Log detalhado para diagnosticar questões sem alternativas (caso do "ficar em branco")
    const emptyAlts = questions.filter(q => !q.alternatives || q.alternatives.length === 0);
    if (emptyAlts.length > 0) {
      console.warn('[ExamPageService] Detectadas questões sem alternativas após mapeamento:', emptyAlts.map(q => q.id));
      console.warn('[ExamPageService] Raw questoes correspondente:', (raw.questoes || []).filter(rq => emptyAlts.some(e => e.id === (rq.idQuestao ?? rq.id))));
      // Fallback: cria placeholders para não quebrar UI (mantém visível que está incompleto)
      emptyAlts.forEach(q => {
        q.alternatives = [
          { id: `${q.id}-ph1`, text: '(alternativa ausente 1)' },
          { id: `${q.id}-ph2`, text: '(alternativa ausente 2)' }
        ];
      });
      // Tentativa adicional: se vieram questões sem alternativas, tentar endpoint alternativo (/avaliacoes/{examId}) para complementar
      try {
        const altResp = await api.get(`/avaliacoes/${examId}`);
        const altRaw = altResp.data;
        if (altRaw && Array.isArray(altRaw.questoes)) {
          questions.forEach(q => {
            if (q.alternatives && q.alternatives.length > 0) return; // já possui (mesmo que placeholders)
            const match = altRaw.questoes.find(rq => (rq.idQuestao ?? rq.id) === q.id);
            if (match && Array.isArray(match.alternativas) && match.alternativas.length > 0) {
              q.alternatives = match.alternativas.map(a => ({
                id: a.idAlternativa ?? a.id ?? a.ordemAlternativa ?? a.ordem ?? null,
                text: a.texto ?? a.text ?? ''
              }));
            }
          });
        }
      } catch (e) {
        console.debug('[ExamPageService] Fallback /avaliacoes/{id} falhou:', e?.response?.data || e?.message);
      }
    }
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
    // Log payload para debugging (verifique console do browser)
    console.debug('[ExamPageService] submitExam payload:', payload);
    // POST para /exam/{examId}/submit
    const resp = await api.post(`/exam/${examId}/submit`, payload);
    return resp.data;
  } catch (err) {
    // Log do body de resposta do backend (quando disponível)
    console.error('[ExamPageService] Erro ao submeter prova:', err?.response?.data || err.message, err);
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
    const avaliacao = await getExamByCourseId(idCurso);
    if (!avaliacao || !avaliacao.idAvaliacao) throw new Error("Avaliação não encontrada para atualização");

    // Payload preservando IDs quando existentes para atualização parcial
    const payload = {
      acertosMinimos: updatedExam.notaMinima,
      questoes: (updatedExam.questoes || []).map(q => ({
        ...(q.idQuestao ? { idQuestao: q.idQuestao } : {}),
        enunciado: q.enunciado,
        numeroQuestao: q.numeroQuestao,
        fkAlternativaCorreta: q.fkAlternativaCorreta,
        alternativas: (q.alternativas || []).map(a => ({
          ...(a.idAlternativa ? { idAlternativa: a.idAlternativa } : {}),
          texto: a.texto,
          ordemAlternativa: a.ordemAlternativa
        }))
      }))
    };

    // Tenta PATCH (parcial); se backend não suportar, faz PUT completo
    try {
      await api.patch(`/avaliacoes/${avaliacao.idAvaliacao}`, payload);
    } catch (e) {
      // Fallback para PUT se PATCH não for implementado
      await api.put(`/avaliacoes/${avaliacao.idAvaliacao}`, payload);
    }
    return { success: true };
  } catch (err) {
    console.error('[ExamPageService] Erro ao atualizar avaliação:', err);
    throw err;
  }
}

/**
 * Exclui avaliação do curso (se possível) após verificar id da avaliação.
 * Retorna { success: true } ou lança erro do backend.
 */
export async function deleteExamByCourseId(idCurso, force = false) {
  if (!idCurso) throw new Error("Parâmetro idCurso obrigatório");
  try {
    const avaliacao = await getExamByCourseId(idCurso);
    if (!avaliacao || !avaliacao.idAvaliacao) throw new Error("Avaliação não encontrada para exclusão");
    const resp = await api.delete(`/avaliacoes/${avaliacao.idAvaliacao}`, { params: { force } });
    return resp.data || { success: true };
  } catch (err) {
    console.error('[ExamPageService] Erro ao deletar avaliação:', err);
    throw err;
  }
}

export async function hasResponsesForExamId(idAvaliacao) {
  if (!idAvaliacao) return false;
  try {
    const resp = await api.get(`/avaliacoes/${idAvaliacao}/respostas/existe`);
    // Retorna o objeto completo { hasResponses, respostasCount } para permitir UI mais rica
    return resp.data;
  } catch (err) {
    // Fallback: if endpoint not available, assume true to be safe
    console.warn('[ExamPageService] Falha ao checar respostas da avaliação:', err);
    return { hasResponses: true, respostasCount: null };
  }
}

const ExamPageService = {
  getExamData,
  submitExam,
  getExamByCourseId,
  updateExam,
  deleteExamByCourseId,
  hasResponsesForExamId
};

export default ExamPageService;
