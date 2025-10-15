import { api } from './api.js';

export async function deleteApostila(idApostila) {
  const resp = await api.delete(`/apostilas/${idApostila}`);
  return resp.data;
}

export async function deleteVideo(idVideo) {
  const resp = await api.delete(`/videos/${idVideo}`);
  return resp.data;
}

export async function toggleApostilaHidden(idApostila) {
  const resp = await api.put(`/apostilas/atualizar-oculto/${idApostila}`);
  return resp.data;
}

export async function toggleVideoHidden(idVideo) {
  const resp = await api.put(`/videos/atualizar-oculto/${idVideo}`);
  return resp.data;
}

export default { deleteApostila, deleteVideo, toggleApostilaHidden, toggleVideoHidden };
