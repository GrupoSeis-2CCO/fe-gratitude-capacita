import { api } from "./api.js";

export async function getTentativasPorMatricula(fkCurso, fkUsuario) {
  if (!fkCurso || !fkUsuario) {
    console.warn('getTentativasPorMatricula called with empty fkCurso or fkUsuario', { fkCurso, fkUsuario });
    return [];
  }

  // defensive: remove accidental whitespace/newline and encode params
  const safeFkCurso = encodeURIComponent(String(fkCurso).trim());
  const safeFkUsuario = encodeURIComponent(String(fkUsuario).trim());

  try {
  const resp = await api.get(`/tentativas/${safeFkCurso}/${safeFkUsuario}`);
  console.debug('getTentativasPorMatricula', { fkCurso: safeFkCurso, fkUsuario: safeFkUsuario, status: resp.status, raw: resp.data });
    if (resp.status === 204 || resp.data == null) return [];

    // Normalize different possible response shapes into an array of tentativas
    const data = resp.data;
    if (Array.isArray(data)) return data;

    // Some backends wrap results in { sample: [...], ... } or { data: [...] }
    if (Array.isArray(data.sample)) return data.sample;
    if (Array.isArray(data.data)) return data.data;

    // If the payload contains a single tentativa object, return it as single-element array
    if (typeof data === 'object' && data !== null) {
      // common key names that may hold the array
      const candidateKeys = ['tentativas', 'items', 'results', 'rows', 'sample', 'data'];
      for (const k of candidateKeys) {
        if (Array.isArray(data[k])) return data[k];
      }

      // If object looks like a single tentativa (has dtTentativa or nota), wrap it
      if ('dtTentativa' in data || 'nota' in data || 'notaAcertos' in data) return [data];
    }

    // Otherwise, no usable list found
    return [];
  } catch (err) {
    console.error('Erro ao buscar tentativas por matrícula:', err);
    if (err?.response?.status === 404) return [];
    throw err;
  }
}
 
export async function getTentativasPorUsuario(fkUsuario) {
   try {
     const safeFkUsuario = encodeURIComponent(String(fkUsuario).trim());
     const resp = await api.get(`/tentativas/usuario/${safeFkUsuario}`);
     if (Array.isArray(resp.data)) return resp.data;
     if (Array.isArray(resp.data?.sample)) return resp.data.sample;
     if (Array.isArray(resp.data?.data)) return resp.data.data;
     if (resp.data) return [resp.data];
     return [];
   } catch (e) {
     return [];
   }
 }

export default { getTentativasPorMatricula, getTentativasPorUsuario };
