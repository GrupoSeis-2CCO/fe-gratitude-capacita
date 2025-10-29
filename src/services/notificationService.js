import api from "./api";

export const getUsers = async () => {
  const res = await api.get(`/usuarios`);
  return res.data;
};

export const sendToAll = async (payload) => {
  const res = await api.post(`/debug/notificacao/enviar-para-todos`, payload || {});
  return res.data;
};

export const sendToUser = async (idUsuario, payload) => {
  const res = await api.post(`/debug/notificacao/enviar-para-usuario/${idUsuario}`, payload || {});
  return res.data;
};

export const sendToEmail = async (payload) => {
  const res = await api.post(`/debug/notificacao/enviar-para-email`, payload || {});
  return res.data;
};

export default {
  getUsers,
  sendToAll,
  sendToUser,
};
