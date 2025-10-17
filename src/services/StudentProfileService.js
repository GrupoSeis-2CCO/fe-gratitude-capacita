import { api } from "./api.js";

// Ensure image URLs are absolute to the backend host when the API returns a relative 
// path like "/uploads/123_avatar.png". This avoids the browser trying to load from the
// frontend origin (e.g., http://localhost:5173/uploads/...) and failing.
function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  const s = String(pathOrUrl);
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("blob:")) {
    return s;
  }
  const base = api?.defaults?.baseURL?.replace(/\/$/, "") || "";
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
}

// Helper: get current user id from JWT or localStorage
function getUserIdFromJwtOrStorage() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return (
          payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub
        );
      }
    }
  } catch (e) {}
  let raw = localStorage.getItem('usuarioId');
  if (!raw) raw = localStorage.getItem('userId');
  return raw ? Number(raw) : null;
}

export async function getProfile(userId) {
  const uid = userId || getUserIdFromJwtOrStorage();
  if (!uid) throw new Error('UserId não encontrado');
  const resp = await api.get(`/usuarios/${uid}`).catch((e) => {
    console.error('[Profile] Falha ao buscar usuário', e?.response || e);
    throw e;
  });
  const u = resp.data || {};
  return {
    id: u.idUsuario || u.id || uid,
    nome: u.nome || '',
    email: u.email || '',
    cpf: u.cpf || '',
    telefone: u.telefone || u.phone || '',
    cargo: u.fkCargo?.nomeCargo || 'Colaborador',
    departamento: u.departamento || '',
    fotoUrl: toAbsoluteUrl(u.fotoUrl || u.foto_url || null),
  };
}

export async function updateProfile({ id, nome, email, telefone, departamento }) {
  const uid = id || getUserIdFromJwtOrStorage();
  if (!uid) throw new Error('UserId não encontrado');
  const body = { nome, email, telefone, departamento };
  const resp = await api.patch(`/usuarios/${uid}`, body).catch((e) => {
    console.error('[Profile] Falha ao atualizar perfil', e?.response || e);
    throw e;
  });
  const data = resp.data;
  // Se o backend devolveu um novo token (após alterar e-mail), persiste-o para manter a sessão válida
  if (data && typeof data === 'object' && data.token) {
    try {
      localStorage.setItem('token', data.token);
      // se vier aninhado { usuario, token }, preferir o usuario
      return data.usuario || data;
    } catch (_) {}
  }
  return data;
}

export async function changePassword({ id, senhaAtual, novaSenha }) {
  const uid = id || getUserIdFromJwtOrStorage();
  if (!uid) throw new Error('UserId não encontrado');
  const resp = await api.put(`/usuarios/${uid}/senha-segura`, { senhaAtual, novaSenha });
  return resp.data;
}

export async function uploadAvatar(file, userId) {
  const uid = userId || getUserIdFromJwtOrStorage();
  if (!uid) throw new Error('UserId não encontrado');
  const form = new FormData();
  form.append('file', file);
  const resp = await api.post(`/usuarios/${uid}/avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  const data = resp.data || {};
  if (data.fotoUrl) data.fotoUrl = toAbsoluteUrl(data.fotoUrl);
  if (data.url) data.url = toAbsoluteUrl(data.url);
  return data; // { fotoUrl }
}

export async function getStats(userId) {
  const uid = userId || getUserIdFromJwtOrStorage();
  if (!uid) throw new Error('UserId não encontrado');
  const resp = await api.get(`/usuarios/${uid}/estatisticas`).catch((e) => {
    console.error('[Profile] Falha ao buscar estatísticas', e?.response || e);
    throw e;
  });
  const s = resp.data || {};
  return {
    cursosConcluidos: s.cursosConcluidos ?? 0,
    cursosFaltantes: s.cursosFaltantes ?? 0,
    horasEstudo: s.horasEstudo ?? 0,
    ultimaAtividade: s.ultimaAtividade || null,
  };
}

const StudentProfileService = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getStats,
};

export default StudentProfileService;
