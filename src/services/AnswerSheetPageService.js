import { api } from "./api.js";

/**
 * Busca dados do gabarito (answer sheet) do backend.
 * Backend retorna: { avaliacao, questoes[], respostasDoUsuario[], tentativa }
 * 
 * Transforma para o formato esperado pelo ExamViewer:
 * {
 *   questions: [{ id, enunciado, alternativas: [{ id, texto, isCorreta }] }],
 *   userAnswers: { questionId: alternativaId },
 *   correctAnswers: { questionId: alternativaId }
 * }
 */
export async function getAnswerSheetData(userId, examId) {
  if (!userId || !examId) throw new Error("Parâmetros obrigatórios ausentes");
  
  try {
    // Backend espera: /answersheet/{examId}/{userId}
    const resp = await api.get(`/answersheet/${examId}/${userId}`);
    const raw = resp.data;

    console.log('[AnswerSheetPageService] Raw backend response:', JSON.stringify(raw, null, 2));

    // Estrutura esperada do backend (baseado no log/stack trace):
    // raw = {
    //   avaliacao: { idAvaliacao, notaMinima, curso },
    //   questoes: [{ idQuestao, enunciado, numeroQuestao, alternativas: [...], alternativaCorreta }],
    //   respostasDoUsuario: [{ questao: {idQuestao}, alternativa: {idAlternativa} }],
    //   tentativa: { dtTentativa, ... }
    // }

    // Backend já retorna no formato: { questions: [...], userAnswers: {}, correctAnswers: {} }
    // Mas vamos manter compatibilidade com múltiplos formatos
    
    let questions, userAnswers, correctAnswers;

    // Se o backend já retornou no formato correto
    if (raw.questions && Array.isArray(raw.questions)) {
      console.log('[AnswerSheetPageService] Backend retornou formato DTO direto');
      questions = raw.questions.map(q => ({
        id: q.id,
        enunciado: q.text || q.enunciado || '',
        numeroQuestao: q.number || q.numeroQuestao || 0,
        alternativas: (q.alternatives || q.alternativas || []).map(alt => ({
          id: alt.id,
          texto: alt.text || alt.texto || '',
          letra: alt.letter || alt.letra || '',
          isCorreta: false // será determinado pela comparação com correctAnswers
        }))
      }));
      
      userAnswers = {};
      if (raw.userAnswers && typeof raw.userAnswers === 'object') {
        Object.keys(raw.userAnswers).forEach(qId => {
          userAnswers[String(qId)] = String(raw.userAnswers[qId]);
        });
      }
      
      correctAnswers = {};
      if (raw.correctAnswers && typeof raw.correctAnswers === 'object') {
        Object.keys(raw.correctAnswers).forEach(qId => {
          correctAnswers[String(qId)] = String(raw.correctAnswers[qId]);
        });
      }
    } else {
      // Formato legado (se existir)
      console.log('[AnswerSheetPageService] Backend retornou formato legado');
      const questoes = raw.questoes || [];
      const respostasDoUsuario = raw.respostasDoUsuario || [];

      questions = questoes.map((q) => {
        const alternativas = (q.alternativas || []).map((alt) => ({
          id: alt.idAlternativa || alt.id,
          texto: alt.texto || alt.text || '',
          letra: alt.ordemAlternativa || alt.letra || '',
          isCorreta: q.alternativaCorreta?.idAlternativa === alt.idAlternativa
        }));

        return {
          id: q.idQuestao || q.id,
          enunciado: q.enunciado || '',
          numeroQuestao: q.numeroQuestao || q.numero || 0,
          alternativas
        };
      });

      userAnswers = {};
      respostasDoUsuario.forEach((resp) => {
        const qId = resp.questao?.idQuestao || resp.fkQuestao || resp.questionId;
        const aId = resp.alternativa?.idAlternativa || resp.fkAlternativa || resp.alternativeId;
        if (qId && aId) userAnswers[String(qId)] = String(aId);
      });

      correctAnswers = {};
      questoes.forEach((q) => {
        const qId = q.idQuestao || q.id;
        const correctAltId = q.alternativaCorreta?.idAlternativa || q.fkAlternativaCorreta;
        if (qId && correctAltId) correctAnswers[String(qId)] = String(correctAltId);
      });
    }

    console.log('[AnswerSheetPageService] Processado:', {
      questionsCount: questions.length,
      userAnswersCount: Object.keys(userAnswers).length,
      correctAnswersCount: Object.keys(correctAnswers).length,
      userAnswersKeys: Object.keys(userAnswers),
      correctAnswersKeys: Object.keys(correctAnswers),
      sampleQuestion: questions[0]?.id,
      sampleCorrectAnswer: correctAnswers[questions[0]?.id],
      userAnswersEmpty: Object.keys(userAnswers).length === 0
    });

    // Normalização adicional e marcação de alternativas corretas:
    // - Garantir que chaves de correctAnswers sejam strings
    // - Se backend marcou alternativas corretas dentro das próprias alternativas,
    //   refletir isso em `correctAnswers` e em cada alternativa.isCorreta
    // - Suportar formatos onde correctAnswers pode vir com chaves alternativas
    const normalizedCorrect = {};
    Object.keys(correctAnswers).forEach((k) => {
      normalizedCorrect[String(k)] = String(correctAnswers[k]);
    });

    // Se correctAnswers estiver vazio, tentamos detectar pela flag nas alternativas
    questions.forEach((q) => {
      const qIdStr = String(q.id);

      // Caso já exista mapping para a questão, mantenha
      if (normalizedCorrect[qIdStr]) {
        // nothing
      } else {
        // Procurar alternativa marcada como correta dentro do objeto da alternativa
        const alt = (q.alternativas || []).find((a) => {
          // aceitar várias propriedades possíveis que indiquem correção
          return Boolean(a.isCorreta || a.isCorrect || a.correta || a.correct);
        });

        if (alt && alt.id != null) {
          normalizedCorrect[qIdStr] = String(alt.id);
        }
      }

      // Marcar isCorreta em alternativas com base no mapping final
      (q.alternativas || []).forEach((a) => {
        a.isCorreta = normalizedCorrect[qIdStr] && String(a.id) === String(normalizedCorrect[qIdStr]);
      });
    });

    // Substitui correctAnswers pelo normalizedCorrect para uso pelo viewer
    correctAnswers = {};
    Object.keys(normalizedCorrect).forEach(k => {
      correctAnswers[String(k)] = String(normalizedCorrect[k]);
    });

    // Construir mapeamento detalhado por questão para debugging
    const perQuestionMapping = questions.map((q) => {
      const qIdStr = String(q.id);
      const ua = userAnswers[qIdStr] || userAnswers[String(q.numeroQuestao)] || userAnswers[String(q.number)] || userAnswers[String(q.numero)] || userAnswers[String(q.id)];
      const ca = correctAnswers[qIdStr] || correctAnswers[String(q.numeroQuestao)] || correctAnswers[String(q.number)] || correctAnswers[String(q.numero)] || correctAnswers[String(q.id)];
      return {
        questionId: q.id,
        numeroQuestao: q.numeroQuestao || q.number || q.numero || null,
        ua: ua ? String(ua) : null,
        ca: ca ? String(ca) : null,
        detectedCorrectAlt: normalizedCorrect[qIdStr] || null,
        alternatives: (q.alternativas || q.alternatives || []).map(a => ({ id: a.id, isCorreta: Boolean(a.isCorreta) }))
      };
    });

    console.log('[AnswerSheetPageService] Per-question mapping:', JSON.stringify(perQuestionMapping, null, 2));

    return {
      questions,
      userAnswers,
      correctAnswers,
      meta: {
        avaliacao: raw.avaliacao,
        tentativa: raw.tentativa,
        perQuestionMapping
      }
    };
  } catch (err) {
    console.error('[AnswerSheetPageService] Erro ao buscar gabarito:', err);
    throw err;
  }
}

const AnswerSheetPageService = {
  getAnswerSheetData
};

export default AnswerSheetPageService;
