import { api } from "./api.js";
import { ensureMatricula } from "./MatriculaService.js";

function safeVal(v) {
  return encodeURIComponent(String(v ?? '').trim());
}

// Buscar lista de materiais do aluno com status de conclusão
export async function listarMateriaisAluno(fkUsuario, fkCurso) {
  if (!fkUsuario || !fkCurso) {
    throw new Error('Parâmetros inválidos para listar materiais do aluno');
  }
  try {
    const response = await api.get(`/materiais-alunos/listar-por-matricula/${safeVal(fkUsuario)}/${safeVal(fkCurso)}`);
    return response.data || [];
  } catch (err) {
    if (err?.response?.status === 404) {
      // Tenta garantir matrícula e refazer
      try { await ensureMatricula(fkUsuario, fkCurso); } catch (_) {}
      const response = await api.get(`/materiais-alunos/listar-por-matricula/${safeVal(fkUsuario)}/${safeVal(fkCurso)}`);
      return response.data || [];
    }
    throw err;
  }
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
  // Garante matrícula antes de finalizar por id
  try { await ensureMatricula(fkUsuario, fkCurso); } catch (_) {}

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
  // Garante matrícula antes de finalizar por tipo/id
  try { await ensureMatricula(fkUsuario, fkCurso); } catch (_) {}

  const paths = buildPathsForFinalizarByMaterial(tipo, idMaterial, fkUsuario, fkCurso);
  try {
    return await tryEndpoints('post', paths);
  } catch (err) {
    // If direct endpoints are not available (404), fallback to fetching the list
    const status = err?.response?.status;
    if (status === 404) {
      // tentar garantir matricula e refazer
      try {
        await ensureMatricula(fkUsuario, fkCurso);
        // retry once after ensuring enrollment
        try {
          return await tryEndpoints('post', paths);
        } catch (_) {
          // continue to fallback logic
        }
      } catch (_) {
        // ignore ensureMatricula failure and continue fallback
      }
      console.debug('[MaterialAlunoService] finalize-by-material endpoints missing, attempting list+finalize-by-id fallback');
      try {
        let listResp;
        try {
          listResp = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${fkCurso}`);
        } catch (listFirstErr) {
          if (listFirstErr?.response?.status === 404) {
            // tenta garantir matrícula e refazer uma vez
            try { await ensureMatricula(fkUsuario, fkCurso); } catch (_) {}
            listResp = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${fkCurso}`);
          } else {
            throw listFirstErr;
          }
        }
        const materiais = listResp.data || [];
        // find matching materialAluno by fkVideo/fkApostila variations
        const encontrado = materiais.find(m => {
          const want = Number(idMaterial);
          if (tipo === 'video') {
            return (
              (m?.fkVideo && m.fkVideo.idVideo && Number(m.fkVideo.idVideo) === want) ||
              (m?.fk_video && m.fk_video.id_video && Number(m.fk_video.id_video) === want) ||
              (m?.videoId && Number(m.videoId) === want) ||
              (m?.idVideo && Number(m.idVideo) === want) ||
              (m?.video_id && Number(m.video_id) === want) ||
              (m?.id_video && Number(m.id_video) === want) ||
              (m?.fkVideo && Number(m.fkVideo) === want) ||
              (m?.fk_video && Number(m.fk_video) === want)
            );
          }
          if (tipo === 'apostila' || tipo === 'pdf') {
            return (
              (m?.fkApostila && m.fkApostila.idApostila && Number(m.fkApostila.idApostila) === want) ||
              (m?.fk_apostila && m.fk_apostila.id_apostila && Number(m.fk_apostila.id_apostila) === want) ||
              (m?.apostilaId && Number(m.apostilaId) === want) ||
              (m?.idApostila && Number(m.idApostila) === want) ||
              (m?.apostila_id && Number(m.apostila_id) === want) ||
              (m?.id_apostila && Number(m.id_apostila) === want) ||
              (m?.fkApostila && Number(m.fkApostila) === want) ||
              (m?.fk_apostila && Number(m.fk_apostila) === want)
            );
          }
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
  finalizarPorMaterial,
  listarMateriaisAluno
};

export default MaterialAlunoService;