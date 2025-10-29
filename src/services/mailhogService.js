import api from './api';

export const getMailhogMessages = async () => {
  const res = await api.get(`/debug/notificacao/mailhog/messages`);
  return res.data;
};

export const clearMailhogMessages = async () => {
  const res = await api.delete(`/debug/notificacao/mailhog/messages`);
  return res.data;
};

export default { getMailhogMessages, clearMailhogMessages };
