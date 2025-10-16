import { api } from './api.js';

export async function uploadFileToS3(file, tipoBucket = 'bronze') {
  // Envia o arquivo para o endpoint backend que salva arquivos em /uploads
  const form = new FormData();
  form.append('file', file);
  form.append('tipoBucket', tipoBucket);
  try {
    const resp = await api.post('/arquivos/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return resp.data; // espera algo como '/uploads/<filename>'
  } catch (err) {
    // Mensagens mais amigáveis para 413 (payload too large)
    const status = err?.response?.status;
    if (status === 413) {
      throw new Error('Arquivo muito grande. Tente uma imagem menor ou comprima antes de enviar.');
    }
    // rethrow with server message if available
    if (err?.response?.data) throw new Error(typeof err.response.data === 'string' ? err.response.data : 'Falha no upload do arquivo');
    throw new Error(err?.message || 'Falha no upload do arquivo');
  }
}

export async function createVideoCommand({ nomeVideo, descricaoVideo, urlVideo, ordemVideo = 1, fkCurso }) {
  const body = { nomeVideo, descricaoVideo, urlVideo, ordemVideo, fkCurso };
  const resp = await api.post('/videos', body);
  return resp.data;
}

export async function createApostilaCommand({ nomeApostilaOriginal, nomeApostilaArmazenamento, descricaoApostila, tamanhoBytes = 0, isApostilaOculto = 0, ordemApostila = 1, fkCurso, urlApostila = null }) {
  // Backend CriarApostilaCommand expects: fkCurso, nomeApostila, descricaoApostila, tamanhoBytes
  const body = {
    fkCurso,
    nomeApostila: nomeApostilaOriginal ?? nomeApostilaArmazenamento ?? 'apostila',
    descricaoApostila: descricaoApostila ?? null,
    tamanhoBytes: tamanhoBytes ?? 0
  };
  const resp = await api.post('/apostilas', body);
  return resp.data;
}

export async function updateApostilaUrl(idApostila, url) {
  if (!idApostila) throw new Error('idApostila is required');
  const resp = await api.patch(`/arquivos/apostila/${idApostila}/url`, { url });
  return resp.data;
}

export async function updateApostila(idApostila, { nomeApostila, descricaoApostila, tamanhoBytes, ordem }) {
  if (!idApostila) throw new Error('idApostila is required');
  const body = { nomeApostila, descricaoApostila, tamanhoBytes, ordem };
  const resp = await api.put(`/apostilas/atualizar-dados/${idApostila}`, body);
  return resp.data;
}

export async function updateVideo(idVideo, { nomeVideo, descricaoVideo, urlVideo, ordemVideo }) {
  if (!idVideo) throw new Error('idVideo is required');
  const body = { nomeVideo, descricaoVideo, urlVideo, ordemVideo };
  const resp = await api.put(`/videos/atualizar-dados/${idVideo}`, body);
  return resp.data;
}

export default { uploadFileToS3, createVideoCommand, createApostilaCommand, updateApostilaUrl, updateApostila, updateVideo };
