import { api } from "./api.js";

function safeVal(v) {
  return encodeURIComponent(String(v ?? '').trim());
}

function buildPathsForFinalizarById(idMaterialAluno, fkUsuario, fkCurso) {
  const a = safeVal(idMaterialAluno);
  const u = safeVal(fkUsuario);
  const c = safeVal(fkCurso);
  return [
    `/materiais-alunos/finalizar/${a}/${u}/${c}`,
    `/material-aluno/finalizar/${a}/${u}/${c}`
  ];
}

function buildPathsForFinalizarByMaterial(tipo, idMaterial, fkUsuario, fkCurso) {
  const t = encodeURIComponent(String(tipo || '').trim());
  const m = safeVal(idMaterial);
  const u = safeVal(fkUsuario);
  const c = safeVal(fkCurso);
  return [
    `/materiais-alunos/finalizar-por-material/${t}/${m}/${u}/${c}`,
    `/material-aluno/finalizar-por-material/${t}/${m}/${u}/${c}`
  ];
}

async function tryEndpoints(method, paths) {
  let lastErr = null;
  for (const p of paths) {
    try {
      if (method === 'put') {
        const resp = await api.put(p);
        console.debug('[MaterialAlunoService] PUT success', p, resp.status);
        return resp.data;
      }
      if (method === 'post') {
        const resp = await api.post(p);
        console.debug('[MaterialAlunoService] POST success', p, resp.status);
        return resp.data;
      }
    } catch (err) {
      lastErr = err;
      console.debug('[MaterialAlunoService] attempt failed', { path: p, method, status: err?.response?.status, body: err?.response?.data });
      const status = err?.response?.status;
      if (status && status !== 404) throw err;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('Nenhum endpoint disponível para finalizar material');
}

export async function finalizarMaterialAluno(idMaterialAluno, fkUsuario, fkCurso) {
  if (!idMaterialAluno || !fkUsuario || !fkCurso) {
    throw new Error('Parâmetros inválidos para finalizar material');
  }

  const paths = buildPathsForFinalizarById(idMaterialAluno, fkUsuario, fkCurso);
  // try POST first (some server configs use POST), then PUT
  try {
    return await tryEndpoints('post', paths);
  } catch (err) {
    return await tryEndpoints('put', paths);
  }
}

export async function finalizarPorMaterial(tipo, idMaterial, fkUsuario, fkCurso) {
  if (!tipo || !idMaterial || !fkUsuario || !fkCurso) {
    throw new Error('Parâmetros inválidos para finalizar por material');
  }

  const paths = buildPathsForFinalizarByMaterial(tipo, idMaterial, fkUsuario, fkCurso);
  try {
    return await tryEndpoints('post', paths);
  } catch (err) {
    // If direct endpoints are not available (404), fallback to fetching the list
    const status = err?.response?.status;
    if (status === 404) {
      console.debug('[MaterialAlunoService] finalize-by-material endpoints missing, attempting list+finalize-by-id fallback');
      try {
        const listResp = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${fkCurso}`);
        const materiais = listResp.data || [];
        // find matching materialAluno by fkVideo or fkApostila
        const encontrado = materiais.find(m => {
          if (tipo === 'video' && m?.fkVideo && m.fkVideo.idVideo) return Number(m.fkVideo.idVideo) === Number(idMaterial);
          if (tipo === 'apostila' && m?.fkApostila && m.fkApostila.idApostila) return Number(m.fkApostila.idApostila) === Number(idMaterial);
          // sometimes the list may include simple fields
          if (tipo === 'video' && m?.videoId) return Number(m.videoId) === Number(idMaterial);
          if (tipo === 'apostila' && m?.apostilaId) return Number(m.apostilaId) === Number(idMaterial);
          return false;
        });

        if (encontrado && encontrado.idMaterialAluno) {
          return await finalizarMaterialAluno(encontrado.idMaterialAluno, fkUsuario, fkCurso);
        }
      } catch (listErr) {
        console.debug('[MaterialAlunoService] fallback list request failed', listErr?.response?.data || listErr.message);
      }
    }
    return await tryEndpoints('put', paths);
  }
}

const MaterialAlunoService = {
  finalizarMaterialAluno,
  finalizarPorMaterial
};

export default MaterialAlunoService;