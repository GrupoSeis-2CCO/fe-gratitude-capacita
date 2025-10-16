import { api } from "./api.js";

export async function getAnswerSheetData(userId, examId) {
  if (!userId || !examId) throw new Error("Parâmetros obrigatórios ausentes");
  // Ajuste o endpoint conforme o backend
  const resp = await api.get(`/exams/${examId}/answersheet/${userId}`);
  return resp.data;
}

const AnswerSheetPageService = {
  getAnswerSheetData
};

export default AnswerSheetPageService;
