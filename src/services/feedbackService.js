import api from "../provider/Api.js";

const feedbackService = {
  // Buscar feedbacks de um curso específico
  async getFeedbacksByCourse(idCurso) {
    try {
      const response = await api.post(`/feedbacks/${idCurso}`);
      // Backend retorna 204 (No Content) quando não há feedbacks
      if (response.status === 204 || response.data == null) return [];
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      throw error;
    }
  },

  // Criar um novo feedback
  async createFeedback(feedbackData) {
    try {
      const response = await api.post("/feedbacks", feedbackData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar feedback:", error);
      throw error;
    }
  },
};

export default feedbackService;
