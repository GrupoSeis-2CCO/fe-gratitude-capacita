import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import { FileText, Play } from 'lucide-react';
import { getMateriaisPorCursoEnsuringMatricula as getMateriaisPorCurso } from "../services/MaterialListPageService.js";
import { api } from "../services/api.js";
import { ensureMatricula, updateUltimoAcesso, getMatriculasPorUsuario } from "../services/MatriculaService.js";

function getStatusColor(status) {
  switch (status) {
    case 'concluido':
      return 'bg-green-500';
    case 'nao-finalizado':
      return 'bg-red-500';
    case 'a-fazer':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-300';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'concluido':
      return 'Concluído';
    case 'nao-finalizado':
      return 'Não Finalizado';
    case 'a-fazer':
      return 'A Fazer';
    default:
      return 'Status';
  }
}

function normalizeMaterial(m, idx) {
  if (!m) return null;
  const id = m.id ?? m.idApostila ?? m.idVideo ?? m.idMaterial ?? null;
  let title = m.titulo ?? m.nomeApostila ?? m.nomeVideo ?? m.title ?? `Material ${id ?? ''}`;
  // determine type
  const tipoRaw = (m.tipo || m.type || '').toString().toLowerCase();
  const type = tipoRaw.includes('video') ? 'video' : (tipoRaw.includes('apostila') || tipoRaw.includes('pdf') ? 'pdf' : (tipoRaw.includes('avaliacao') ? 'avaliacao' : (m.urlVideo || m.url ? 'video' : 'pdf')));

  // description fallback
  const description = m.descricao ?? m.descricaoApostila ?? m.descricaoVideo ?? m.description ?? '';

  // determine status: prefer explicit fields, else infer from boolean flags or progress
  let status = null;
  if (typeof m.status !== 'undefined' && m.status !== null) {
    status = String(m.status).toLowerCase();
  } else if (typeof m.situacao !== 'undefined' && m.situacao !== null) {
    status = String(m.situacao).toLowerCase();
  } else if (typeof m.isConcluido !== 'undefined') {
    status = (m.isConcluido === 1 || m.isConcluido === true) ? 'concluido' : 'a-fazer';
  } else if (typeof m.concluido !== 'undefined') {
    status = (m.concluido === 1 || m.concluido === true) ? 'concluido' : 'a-fazer';
  }

  // normalize to our three statuses
  if (status === 'concluido' || status === 'completed' || status === 'true' || status === '1') {
    status = 'concluido';
  } else if (status === 'nao-finalizado' || status === 'inprogress' || status === 'in_progress' || status === 'parcial') {
    status = 'nao-finalizado';
  } else if (status === 'a-fazer' || status === 'to-do' || status === 'todo' || status === '0' || status == null) {
    // keep as a-fazer when unknown
    status = 'a-fazer';
  }

  return {
    ...m,
    id,
    // strip trailing .pdf for apostilas (defensive)
    title: type === 'pdf' && typeof title === 'string' ? title.replace(/\.pdf$/i, '') : title,
    type,
    description,
    status,
  };
}

export default function StudentMaterialsListPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType?.();
  const { idCurso } = useParams();
  const navigate = useNavigate();

  // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
  if (isLoggedIn?.() === false || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filtros
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // acessoFilter removed per UX request

  function getUserIdFromJwtOrStorage() {
    // prefer explicit localStorage key, else parse JWT token
    const raw = localStorage.getItem('usuarioId');
    const fromStorage = raw ? Number(String(raw).trim()) : undefined;
    if (fromStorage) return fromStorage;
    try {
      const token = localStorage.getItem('token');
      if (!token) return undefined;
      const parts = token.split('.');
      if (parts.length !== 3) return undefined;
      const payload = JSON.parse(atob(parts[1]));
      const id = (
        payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub
      );
      return id ? Number(id) : undefined;
    } catch (_) {
      return undefined;
    }
  }

  function isConcludedBackend(rec) {
    const truthy = (v) => {
      if (v === true || v === 1) return true;
      const s = String(v).trim().toLowerCase();
      return s === '1' || s === 'true' || s === 't' || s === 'y' || s === 'yes' || s === 's' || s === 'sim';
    };
    // backend usa campo 'finalizada' em material_aluno
    if (truthy(rec?.finalizado) || truthy(rec?.finalizada) || truthy(rec?.concluido) || truthy(rec?.isConcluido)) return true;
    const s1 = String(rec?.status || '').toLowerCase();
    const s2 = String(rec?.situacao || '').toLowerCase();
    if (s1.includes('conclu') || s1.includes('finaliz') || s1.includes('complet')) return true;
    if (s2.includes('conclu') || s2.includes('finaliz') || s2.includes('complet')) return true;
    if (Number(rec?.progresso || 0) >= 100) return true;
    return false;
  }

  function extractMaterialKey(rec) {
    // Alguns endpoints retornam fkVideo/fkApostila como número direto; outros, como objeto { idVideo }/{ idApostila }
    // Suportar snake_case também (fk_video / fk_apostila) e variações id_video / id_apostila
    const vid =
      rec?.fkVideo?.idVideo ?? rec?.fk_video?.idVideo ?? rec?.fk_video?.id_video ??
      rec?.videoId ?? rec?.idVideo ?? rec?.video_id ?? rec?.id_video ??
      rec?.fkVideo ?? rec?.fk_video;
    const ap  =
      rec?.fkApostila?.idApostila ?? rec?.fk_apostila?.idApostila ?? rec?.fk_apostila?.id_apostila ??
      rec?.apostilaId ?? rec?.idApostila ?? rec?.apostila_id ?? rec?.id_apostila ??
      rec?.fkApostila ?? rec?.fk_apostila;
    let id = null;
    let type = null;
    if (vid != null) { id = Number(vid); type = 'video'; }
    else if (ap != null) { id = Number(ap); type = 'pdf'; }
    else {
      // fallback genérico
      id = rec?.idMaterial ?? rec?.materialId ?? null;
      if (id != null) {
        // sem tipo explícito no registro: iremos casar apenas por id mais adiante usando ambos (video/pdf)
        type = null;
      }
    }
    return { id, type };
  }

  // Merge strictly using backend data: only mark concluded when backend provides explicit fkVideo/fkApostila IDs
  async function mergeWithAlunoMateriais(idCursoNum, normalizedMaterials) {
    try {
      const fkUsuario = getUserIdFromJwtOrStorage();
      if (!fkUsuario) return normalizedMaterials;
      // garante matrícula antes de consultar materiais do aluno; se falhar, ainda tentamos seguir
      try { await ensureMatricula(fkUsuario, idCursoNum); } catch (e) { /* noop */ }
      const resp = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${idCursoNum}`);
      const arr = resp?.data || [];
      console.debug('[StudentMaterialsList] materiais-alunos length:', Array.isArray(arr) ? arr.length : 'n/a');
      if (!Array.isArray(arr) || arr.length === 0) return normalizedMaterials;
      // Logar os registros recebidos para diagnosticar mapeamento
      try {
        console.debug('[StudentMaterialsList] raw materiais-alunos:', arr);
        console.debug('[StudentMaterialsList] raw materiais-alunos JSON:', JSON.stringify(arr, null, 2));
      } catch (_) {}
      // Construir mapa robusto chave->registro para aplicar diretamente ao material correspondente
      // Aceitamos várias formas de id do backend e tentamos casar com as propriedades do material normalizado
      const mapKeyToRecord = new Map();
      for (const r of arr) {
        const concludedBackend = isConcludedBackend(r);
        if (!concludedBackend) continue;
        // extrai possível id e tipo explicitamente
        const { id: recId, type: recType } = extractMaterialKey(r);
        // tentar também extrair id composto (caso venha dentro de idMaterialAlunoComposto)
        const idMaterialAluno = r?.idMaterialAluno ?? r?.idMaterialAlunoComposto?.idMaterialAluno ?? r?.idMaterialAlunoComposto?.idMaterial ?? r?.idMaterialAluno;

        if (recId != null && recType) {
          mapKeyToRecord.set(`${recType}:${Number(recId)}`, { raw: r, idMaterialAluno: idMaterialAluno });
        } else if (recId != null) {
          // tipo não explícito — registrar sob uma chave genérica para tentar casar por id posteriormente
          mapKeyToRecord.set(`any:${Number(recId)}`, { raw: r, idMaterialAluno: idMaterialAluno });
        } else {
          // se não houver id, ignoramos esse registro (não dá para casar com segurança)
        }
      }
      console.debug('[StudentMaterialsList] concluded material keys from backend (strict):', Array.from(mapKeyToRecord.keys()));

      // Agora, mapeia os materiais normalizados e aplica marcações quando encontrarmos um registro correspondente
      return normalizedMaterials.map(m => {
        try {
          const keysToCheck = [];
          if (m.type) keysToCheck.push(`${m.type}:${Number(m.id)}`);
          // também verificar chaves com nomes alternativos se o material expuser idApostila/idVideo
          if (m.idApostila) keysToCheck.push(`pdf:${Number(m.idApostila)}`);
          if (m.idVideo) keysToCheck.push(`video:${Number(m.idVideo)}`);
          // fallback: check any:id
          keysToCheck.push(`any:${Number(m.id)}`);

          for (const k of keysToCheck) {
            if (mapKeyToRecord.has(k)) {
              const rec = mapKeyToRecord.get(k);
              return { ...m, status: 'concluido', finalizado: true, idMaterialAluno: rec?.idMaterialAluno ?? m.idMaterialAluno };
            }
          }
        } catch (_) {
          // ignore per-item errors and return original material
        }
        return m;
      });
    } catch (e) {
      // se falhar, retorna como veio
      console.debug('[StudentMaterialsList] mergeWithAlunoMateriais failed:', e?.response?.data || e?.message);
      return normalizedMaterials;
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!idCurso) {
          setMaterials([]);
          return;
        }
        // Garante matrícula antes de qualquer listagem, para evitar 404 do backend
        try {
          const token = localStorage.getItem('token');
          let uid = null;
          const raw = localStorage.getItem('usuarioId');
          if (raw) uid = Number(String(raw).trim());
          if (!uid && token) {
            const parts = token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const pId = payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub;
              if (pId != null) uid = Number(pId);
            }
          }
          if (uid) {
            const idCursoNum = Number(idCurso);
            console.debug('[StudentMaterialsList] ensureMatricula before load', { uid, idCurso: idCursoNum });
            await ensureMatricula(uid, idCursoNum);
            // marca último acesso no backend
            await updateUltimoAcesso(uid, idCursoNum);
            // lê matrícula para saber se já acessou alguma vez
            const mats = await getMatriculasPorUsuario(uid);
            const forThis = (Array.isArray(mats) ? mats : []).find(m => Number(m?.curso?.idCurso ?? m?.fkCurso?.idCurso ?? m?.fkCurso) === idCursoNum);
            const ua = forThis?.ultimoAcesso || forThis?.ultimo_senso || forThis?.ultimoAcessoMatricula || null;
            // access tracking kept server-side, no local filtro
          }
        } catch (e) {
          console.debug('[StudentMaterialsList] ensureMatricula failed (continuing):', e?.response?.data || e?.message);
        }
        const resp = await getMateriaisPorCurso(idCurso);
        if (!mounted) return;
        // service may return array or an object { curso, materiais }
        let arr = [];
        if (Array.isArray(resp)) arr = resp;
        else if (resp?.materiais) arr = resp.materiais;
        else if (resp?.data && Array.isArray(resp.data)) arr = resp.data;
        else if (resp?.materials) arr = resp.materials;
        else if (resp) arr = Array.isArray(resp) ? resp : [resp];

  let normalized = (arr || []).map((m, i) => normalizeMaterial(m, i)).filter(Boolean);
        // ensure order field and strip .pdf if needed
        normalized = normalized.map((m, i) => ({ ...m, order: m.order ?? m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? (i + 1), title: (m.type === 'pdf' && typeof m.title === 'string') ? m.title.replace(/\.pdf$/i, '') : m.title }));
        normalized = await mergeWithAlunoMateriais(Number(idCurso), normalized);
        // stable combined ordering: sort by order asc, within same order put videos before pdfs, then assign displayOrder sequentially
        normalized.sort((a, b) => {
          const oa = Number(a.order || 0), ob = Number(b.order || 0);
          if (oa !== ob) return oa - ob;
          const weight = (t) => t === 'video' ? 0 : (t === 'pdf' ? 1 : 2);
          return weight(a.type) - weight(b.type);
        });
        normalized = normalized.map((m, i) => ({ ...m, displayOrder: i + 1 }));
        setMaterials(normalized);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
        setError(err?.message || 'Erro ao carregar materiais');
        setMaterials([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [idCurso]);

  // listen to completion events and refetch from backend (backend is source of truth)
  useEffect(() => {
    let mounted = true;
    async function fetchOnce() {
      try {
        if (!idCurso) return;
        const resp = await getMateriaisPorCurso(idCurso);
        let arr = [];
        if (Array.isArray(resp)) arr = resp;
        else if (resp?.materiais) arr = resp.materiais;
        else if (resp?.data && Array.isArray(resp.data)) arr = resp.data;
        else if (resp?.materials) arr = resp.materials;
        else if (resp) arr = Array.isArray(resp) ? resp : [resp];
  let normalized = (arr || []).map((m, i) => normalizeMaterial(m, i)).filter(Boolean);
        normalized = normalized.map((m, i) => ({ ...m, order: m.order ?? m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? (i + 1), title: (m.type === 'pdf' && typeof m.title === 'string') ? m.title.replace(/\.pdf$/i, '') : m.title }));
        normalized = await mergeWithAlunoMateriais(Number(idCurso), normalized);
        normalized.sort((a, b) => {
          const oa = Number(a.order || 0), ob = Number(b.order || 0);
          if (oa !== ob) return oa - ob;
          const weight = (t) => t === 'video' ? 0 : (t === 'pdf' ? 1 : 2);
          return weight(a.type) - weight(b.type);
        });
        normalized = normalized.map((m, i) => ({ ...m, displayOrder: i + 1 }));
        return mounted ? normalized : null;
      } catch (e) {
        // mantém estado atual em caso de erro
        console.debug('Falha ao refazer fetch após finalização:', e);
        return null;
      }
    }

    function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

    async function refetchWithRetry() {
      let last = null;
      const attempts = 8; // allow backend to update 'finalizada' field
      for (let attempt = 0; attempt < attempts; attempt++) {
        const normalized = await fetchOnce();
        if (normalized) {
          last = normalized;
          setMaterials(normalized);
          return;
        }
        // exponential-ish backoff up to ~2s
        const delay = Math.min(2000, 250 * (attempt + 1));
        await sleep(delay);
      }
      if (last) setMaterials(last);
    }

    function onCompleted(e) {
      const { idCurso: courseId } = e.detail || {};
      if (String(courseId) !== String(idCurso)) return;
      // Sem otimismos: refetch e deixa o backend ser a fonte da verdade
      refetchWithRetry();
    }
    window.addEventListener('material:finalizado', onCompleted);
    return () => { mounted = false; window.removeEventListener('material:finalizado', onCompleted); };
  }, [idCurso]);

  // Remover avaliação da lista base (acesso à avaliação via banner/botão dedicado)
  // keep a single combined, ordered list (videos + apostilas) — exclude only 'avaliacao'
  const baseMaterials = useMemo(() => {
    const arr = (materials || []).filter(m => (m?.type || m?.tipo) !== 'avaliacao');
    // prefer displayOrder (assigned after normalization), fall back to order
    return arr.slice().sort((a, b) => (Number(a.displayOrder ?? a.order ?? 0) - Number(b.displayOrder ?? b.order ?? 0)));
  }, [materials]);

  // Aplicar filtros (nome/título e status)
  const filteredMaterials = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    let arr = baseMaterials.filter(m => {
      const title = (m.title || m.titulo || '').toString().toLowerCase();
      const desc = (m.description || m.descricao || '').toString().toLowerCase();
      const matchesText = text ? (title.includes(text) || desc.includes(text)) : true;
      const matchesStatus = statusFilter ? (String(m.status).toLowerCase() === statusFilter) : true;
      return matchesText && matchesStatus;
    });
    // preserve global ordering by `displayOrder` after filtering
    const sorted = arr.slice().sort((a, b) => (Number(a.displayOrder ?? a.order ?? 0) - Number(b.displayOrder ?? b.order ?? 0)));
    return sorted;
  }, [baseMaterials, searchText, statusFilter]);

  const { total, completed, percent } = useMemo(() => {
    const total = baseMaterials.length;
    const completed = baseMaterials.filter(m => m.status === 'concluido').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [baseMaterials]);

  const MaterialItem = ({ material, index }) => (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 mb-4 relative cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/cursos/${idCurso}/material/${(material.type || material.tipo)}-${material.id}`)}
    >
      <div className={`absolute top-0 right-0 w-3 h-full rounded-r-lg ${getStatusColor(material.status)}`}></div>

      <div className="w-20 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
        {material.type === 'pdf' ? (
          <FileText size={32} className="text-red-600" />
        ) : (
          <div className="relative">
            <div className="w-16 h-12 bg-black rounded flex items-center justify-center">
              <Play size={16} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 pr-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            Material {material.displayOrder ?? material.order ?? (index + 1)} - {material.title}
          </h3>
          <span className="text-sm text-gray-500">{getStatusText(material.status)}</span>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {material.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-8">
          <TituloPrincipal>Materiais do Curso</TituloPrincipal>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-600">Progresso</span>
            <span className="text-sm text-gray-600">{percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-black h-3 rounded-full" style={{ width: `${percent}%` }}></div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Pesquisar por título ou descrição"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
              />
            </div>
            <div className="w-full md:w-56">
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="" disabled>Selecione</option>
                <option value="concluido">Concluído</option>
                <option value="a-fazer">A Fazer</option>
              </select>
            </div>
            {/* Acesso ao curso filter removed per request */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setSearchText(""); setStatusFilter(""); }}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : baseMaterials.length === 0 ? (
            <div className="text-gray-600">Nenhum material disponível.</div>
          ) : (
            filteredMaterials.map((material, index) => {
              const uid = material?.id != null ? String(material.id) : `${material.type || 'mat'}-${index}`;
              // incluir o tipo no key para evitar colisões entre video/apostila com mesmo id
              const key = `${idCurso}-${material.type || 'mat'}-${uid}`;
              return <MaterialItem key={key} material={material} index={index} />
            })
          )}
        </div>

        {/* Avaliação Final banner (kept but not creating anything) */}
        <div className="mt-8 bg-orange-100 border-l-4 border-orange-500 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center">
                <FileText size={32} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Avaliação Final</h3>
                <p className="text-sm text-gray-600">10 Questões Objetivas</p>
                <p className="text-sm text-gray-600">Nota mínima: 6/10</p>
              </div>
            </div>
            <div>
              {/* navigation only; no creation */}
              <button onClick={() => navigate(`/cursos/${idCurso}/material/avaliacao`)} className="px-4 py-2 bg-black text-white rounded">Iniciar Avaliação</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
