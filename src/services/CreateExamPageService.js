import { api } from "./api.js";

/**
 * Busca avaliações (exames) do backend.
 * Espera que o backend retorne um array de avaliações.
 */
export async function getExams() {
  try {
    const resp = await api.get("/avaliacoes");
    return resp.data;
  } catch (err) {
    console.error("[CreateExamPageService] Erro ao buscar exames:", err);
    throw err;
  }
}

/**
 * Cria uma nova avaliação no backend.
 * 
 * @param {Object} examData - Dados da avaliação
 * @param {number} examData.fkCurso - ID do curso
 * @param {number} examData.notaMinima - Nota mínima para aprovação (0-10)
 * @param {Array} examData.questoes - Array de questões
 * @param {string} examData.questoes[].enunciado - Texto da questão
 * @param {number} examData.questoes[].numeroQuestao - Número sequencial da questão
 * @param {Array} examData.questoes[].alternativas - Array de alternativas
 * @param {string} examData.questoes[].alternativas[].texto - Texto da alternativa
 * @param {number} examData.questoes[].alternativas[].ordemAlternativa - Ordem da alternativa (0-based)
 * @param {number} examData.questoes[].fkAlternativaCorreta - Índice da alternativa correta
 * 
 * @returns {Promise<Object>} Avaliação criada com IDs gerados
 */
export async function createExam(examData) {
  try {
    console.log('[CreateExamPageService] Criando avaliação:', JSON.stringify(examData, null, 2));
    
    // Validações básicas
    if (!examData.fkCurso) {
      throw new Error('ID do curso é obrigatório');
    }
    
    if (!examData.questoes || examData.questoes.length === 0) {
      throw new Error('A avaliação deve ter pelo menos uma questão');
    }
    
    // Validar cada questão
    examData.questoes.forEach((q, idx) => {
      if (!q.enunciado || q.enunciado.trim() === '') {
        throw new Error(`Questão ${idx + 1}: enunciado é obrigatório`);
      }
      
      if (!q.alternativas || q.alternativas.length < 2) {
        throw new Error(`Questão ${idx + 1}: deve ter pelo menos 2 alternativas`);
      }
      
      const hasCorrect = q.alternativas.some(alt => alt.ordemAlternativa === q.fkAlternativaCorreta);
      if (!hasCorrect) {
        throw new Error(`Questão ${idx + 1}: deve ter uma alternativa marcada como correta`);
      }
      
      q.alternativas.forEach((alt, altIdx) => {
        if (!alt.texto || alt.texto.trim() === '') {
          throw new Error(`Questão ${idx + 1}, Alternativa ${altIdx + 1}: texto é obrigatório`);
        }
      });
    });
    
    const resp = await api.post("/avaliacoes", examData);
    console.log('[CreateExamPageService] Avaliação criada com sucesso:', resp.data);
    return resp.data;
  } catch (err) {
    console.error("[CreateExamPageService] Erro ao criar avaliação:", err);
    const message = err?.response?.data?.message || err?.message || 'Erro desconhecido ao criar avaliação';
    throw new Error(message);
  }
}

/**
 * Deleta uma avaliação do backend.
 * 
 * @param {number} examId - ID da avaliação
 * @returns {Promise<void>}
 */
export async function deleteExam(examId) {
  try {
    await api.delete(`/avaliacoes/${examId}`);
    console.log('[CreateExamPageService] Avaliação deletada:', examId);
  } catch (err) {
    console.error("[CreateExamPageService] Erro ao deletar avaliação:", err);
    throw err;
  }
}

const CreateExamPageService = { 
  getExams, 
  createExam,
  deleteExam 
};
export default CreateExamPageService;
