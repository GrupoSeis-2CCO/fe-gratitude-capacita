import api from "./api";

/**
 * Serviço para envio de notificações por email via RabbitMQ.
 * Endpoints do backend: /api/email-notifications/*
 */

/**
 * Lista todos os colaboradores disponíveis para receber notificações.
 */
export const getCollaborators = async () => {
  const res = await api.get(`/api/email-notifications/collaborators`);
  return res.data;
};

/**
 * Lista todos os cursos disponíveis.
 */
export const getCourses = async () => {
  const res = await api.get(`/api/email-notifications/courses`);
  return res.data;
};

/**
 * Envia notificação de novo curso para TODOS os colaboradores.
 * @param {Object} payload - { idCurso: number, tituloCurso?: string, descricaoCurso?: string }
 */
export const sendToAllCollaborators = async (payload) => {
  const res = await api.post(`/api/email-notifications/send-to-collaborators`, payload);
  return res.data;
};

/**
 * Envia notificação para um colaborador específico por ID.
 * @param {number} idUsuario - ID do usuário colaborador
 * @param {Object} payload - { idCurso: number, tituloCurso?: string, descricaoCurso?: string }
 */
export const sendToUser = async (idUsuario, payload) => {
  const res = await api.post(`/api/email-notifications/send-to-user/${idUsuario}`, payload || {});
  return res.data;
};

/**
 * Envia notificação para um email específico.
 * @param {Object} payload - { idCurso?: number, emailAluno: string, nomeAluno?: string }
 */
export const sendToEmail = async (payload) => {
  const res = await api.post(`/api/email-notifications/send-to-email`, payload);
  return res.data;
};

/**
 * Verifica o status do sistema de mensageria.
 */
export const healthCheck = async () => {
  const res = await api.get(`/api/email-notifications/health`);
  return res.data;
};

export default {
  getCollaborators,
  getCourses,
  sendToAllCollaborators,
  sendToUser,
  sendToEmail,
  healthCheck,
};
