import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import GradientSideRail from "../components/GradientSideRail.jsx";
import SmartImage from "../components/SmartImage.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import { FileText, Youtube, CheckCircle2, Loader2 } from 'lucide-react';
import MaterialPageService from "../services/MaterialPageService.js";
import { getMateriaisPorCursoEnsuringMatricula as getMateriaisPorCurso } from "../services/MaterialListPageService.js";
import MaterialAlunoService from "../services/MaterialAlunoService.js";
import { ensureMatricula, updateUltimoAcesso } from "../services/MatriculaService.js";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../services/api.js";

// Student view of a single material with backend integration, transcript and PDF rendering
export default function StudentMaterialPage() {
  const { idCurso, idMaterial } = useParams();
  // Aceita formatos "123" (legado) e "video-123" / "apostila-4"
  const parsed = React.useMemo(() => {
    const raw = String(idMaterial || '').trim();
    const m = raw.match(/^(video|apostila|pdf)-(\d+)$/i);
    if (m) {
      const t = m[1].toLowerCase() === 'pdf' ? 'apostila' : m[1].toLowerCase();
      return { tipo: t, id: Number(m[2]) };
    }
    return { tipo: null, id: Number(raw) };
  }, [idMaterial]);
  const navigate = useNavigate();
  const { getCurrentUserType, isLoggedIn } = useAuth?.() || { getCurrentUserType: () => undefined, isLoggedIn: () => true };
  const userType = getCurrentUserType?.();

  // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
  if (isLoggedIn?.() === false || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [material, setMaterial] = useState(null);
  const [materialsList, setMaterialsList] = useState([]); // lista para navegacao correta
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [transcricaoAtiva, setTranscricaoAtiva] = useState(false);
  const [transcricaoCarregando, setTranscricaoCarregando] = useState(false);
  const [transcricao, setTranscricao] = useState([]); // array de { start, dur, text }
  const [allMaterialsCompleted, setAllMaterialsCompleted] = useState(false);
  const [hasExam, setHasExam] = useState(false);
  const [isLastMaterial, setIsLastMaterial] = useState(false);
  const materialsListRef = useRef([]);

  // Helpers para normalizar o material e URL de video vindos do backend
  const getVideoUrl = (m) => {
    if (!m) return "";
    const candidates = [
      m.urlVideo,
      m.url_video,
      m.videoUrl,
      m.video_url,
      m.linkVideo,
      m.link_video,
      m.link,
      m.url,
    ];
    return candidates.find((c) => c) || "";
  };

  const normalizeTipo = (data) => {
    const raw = (data?.tipo || data?.type || parsed.tipo || "").toString().toLowerCase();
    if (raw.includes("video")) return "video";
    if (raw.includes("apostila") || raw.includes("pdf")) return "apostila";
    return getVideoUrl(data) ? "video" : "apostila";
  };

  // YouTube player refs
  const ytPlayerRef = useRef(null);
  const finalizedRef = useRef(false);
  const ytContainerId = `yt-student-player-${idCurso}-${idMaterial}`;

  async function loadMaterial() {
    setLoading(true);
    setError(null);
    try {
      const targetId = Number(parsed.id);
      const res = await MaterialPageService.getMaterialDoCurso(parseInt(idCurso), targetId, parsed.tipo || (material?.tipo));
      const normalized = res ? { ...res } : null;
      if (normalized) {
        const tipo = normalizeTipo(res);
        normalized.tipo = tipo;
        if (tipo === "video" && !normalized.url) {
          normalized.url = getVideoUrl(res);
        }
      }
      setMaterial(normalized);
    } catch (err) {
      const serverData = err?.response?.data;
      if (serverData) setError(JSON.stringify(serverData, null, 2));
      else setError(err.message || String(err));
      setMaterial(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMaterial(); }, [idCurso, idMaterial, parsed.id]);
  useEffect(() => { setVideoLoaded(false); finalizedRef.current = false; }, [idMaterial, idCurso]);

  // Check if course has an exam
  useEffect(() => {
    const checkExam = async () => {
      try {
        const response = await api.get(`/avaliacoes/curso/${idCurso}`);
        const hasAvaliacao = response.data && (Array.isArray(response.data) ? response.data.length > 0 : true);
        console.log('[StudentMaterialPage] Exam check:', { idCurso, hasAvaliacao });
        setHasExam(hasAvaliacao);
      } catch (err) {
        console.log('[StudentMaterialPage] Exam check error:', err);
        setHasExam(false);
      }
    };
    if (idCurso) {
      checkExam();
    }
  }, [idCurso]);

  // Check if all materials are completed
  useEffect(() => {
    const checkAllCompleted = async () => {
      try {
        // Get user ID from localStorage or JWT
        let fkUsuario = undefined;
        const raw = localStorage.getItem('usuarioId');
        fkUsuario = raw ? Number(String(raw).trim()) : undefined;
        if (!fkUsuario) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                const id = payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub;
                fkUsuario = id ? Number(id) : undefined;
              }
            }
          } catch (_) {}
        }
        
        if (!fkUsuario || !idCurso || materialsList.length === 0) return;
        
        const resp = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${idCurso}`);
        const materiaisAluno = resp?.data || [];
        console.log('[StudentMaterialPage] Materiais aluno:', materiaisAluno);
        
        // Helper function to check if material is concluded
        const isConcluded = (rec) => {
          const truthy = (v) => {
            if (v === true || v === 1) return true;
            const s = String(v).trim().toLowerCase();
            return s === '1' || s === 'true' || s === 't' || s === 'y' || s === 'yes' || s === 's' || s === 'sim';
          };
          if (truthy(rec?.finalizado) || truthy(rec?.finalizada) || truthy(rec?.concluido) || truthy(rec?.isConcluido) || truthy(rec?.isFinalizado)) return true;
          return false;
        };
        
        const completedCount = materiaisAluno.filter(m => isConcluded(m)).length;
        const totalMaterials = materialsList.length;
        const allCompleted = completedCount >= totalMaterials && totalMaterials > 0;
        
        console.log('[StudentMaterialPage] Completion check:', { completedCount, totalMaterials, allCompleted });
        setAllMaterialsCompleted(allCompleted);
      } catch (err) {
        console.log('[StudentMaterialPage] Error checking completion:', err);
      }
    };
    
    if (idCurso && materialsList.length > 0) {
      checkAllCompleted();
    }
  }, [idCurso, materialsList, material?.finalizado]);

  // Carrega a lista de materiais para permitir navegação por ordem/IDs corretos
  useEffect(() => {
    let mounted = true;
    async function loadList() {
      try {
        if (!idCurso) return;
        const resp = await getMateriaisPorCurso(idCurso);
        let arr = [];
        if (Array.isArray(resp)) arr = resp; else if (resp?.materiais) arr = resp.materiais; else if (resp?.data && Array.isArray(resp.data)) arr = resp.data; else if (resp) arr = [resp];
        // excluir avaliação
        const onlyMaterials = (arr || []).filter(m => (m?.tipo || m?.type) !== 'avaliacao');
        // normalizar para ter id, tipo ('video'|'apostila'), order e displayOrder consistentes com a listagem
        let normalized = onlyMaterials.map((m, idx) => {
          const id = m.id ?? m.idApostila ?? m.idVideo ?? m.idMaterial ?? null;
          const tRaw = (m.tipo || m.type || '').toString().toLowerCase();
          const tipo = tRaw.includes('video') ? 'video' : (tRaw.includes('apostila') || tRaw.includes('pdf') ? 'apostila' : (m.urlVideo || m.url ? 'video' : 'apostila'));
          const order = m.order ?? m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? (idx + 1);
          return { ...m, id, tipo, order };
        });
        // ordenar por order asc; dentro do mesmo order, videos antes de apostilas (alinha com StudentMaterialsListPage)
        const weight = (t) => t === 'video' ? 0 : (t === 'apostila' ? 1 : 2);
        normalized.sort((a, b) => {
          const oa = Number(a.order || 0), ob = Number(b.order || 0);
          if (oa !== ob) return oa - ob;
          return weight(a.tipo) - weight(b.tipo);
        });
        // atribuir displayOrder sequencial para uso no título/numeração estável
        normalized = normalized.map((m, i) => ({ ...m, displayOrder: i + 1 }));
        if (mounted) {
          setMaterialsList(normalized);
          materialsListRef.current = normalized;
          // Check if current material is the last one
          const curId = Number(parsed.id);
          const curType = parsed.tipo;
          const idx = normalized.findIndex(m => Number(m?.id) === curId && ((m?.tipo) === curType || !curType));
          setIsLastMaterial(idx >= 0 && idx === normalized.length - 1);
        }
      } catch (e) {
        // mantém navegação ingênua em caso de falha
        if (mounted) setMaterialsList([]);
      }
    }
    loadList();
    return () => { mounted = false };
  }, [idCurso]);

  // Garante matrícula ao abrir a página do material (evita 404 na listagem/finalização)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuarioId');
      const fkUsuario = raw ? Number(String(raw).trim()) : undefined;
      const fkCurso = Number(String(idCurso || '').trim());
      if (fkUsuario && fkCurso) {
        const key = `ultimoAcesso:${fkUsuario}:${fkCurso}`;
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || '0');
        const shouldUpdate = !last || (now - last) > 15000; // 15s de janela
        ensureMatricula(fkUsuario, fkCurso)
          .then(() => {
            if (shouldUpdate) {
              return updateUltimoAcesso(fkUsuario, fkCurso)
                .catch(() => {})
                .finally(() => { try { sessionStorage.setItem(key, String(Date.now())); } catch (_) {} });
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, [idCurso]);

  // YouTube Iframe API loader (no extra npm deps)
  function loadYouTubeIframeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const existing = document.getElementById('youtube-iframe-api');
      if (existing) {
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) { clearInterval(check); resolve(window.YT); }
        }, 50);
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'youtube-iframe-api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = function() { resolve(window.YT); };
    });
  }

  // Initialize YT player when videoLoaded is true
  useEffect(() => {
    let mounted = true;
    async function initPlayer() {
      if (!videoLoaded || !material) return;
      const url = material.url || '';
      const ytMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
      if (!ytMatch || !ytMatch[1]) return;
      const ytId = ytMatch[1];

      const YT = await loadYouTubeIframeAPI();
      if (!mounted) return;

      if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch (e) {} ytPlayerRef.current = null; }

      ytPlayerRef.current = new YT.Player(ytContainerId, {
        videoId: ytId,
        playerVars: { modestbranding: 1, rel: 0, enablejsapi: 1, origin: window.location.origin },
        events: {
          onStateChange: async (event) => {
            // 0 === ENDED
            if (event.data === 0) {
              if (!finalizedRef.current) {
                finalizedRef.current = true;
                await finalizeMaterialSafe();
              }
              try { ytPlayerRef.current?.destroy(); } catch (e) {}
              ytPlayerRef.current = null;
              if (mounted) setVideoLoaded(false);
            }
          }
        }
      });
    }
    initPlayer();
    return () => { mounted = false; if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch (e) {} ytPlayerRef.current = null; } };
  }, [videoLoaded, material]);

  const handleGoBack = () => navigate(`/cursos/${idCurso}/material`);
  const navList = materialsList;
  const currentIndex = React.useMemo(() => {
    const curId = Number(parsed.id);
    const curType = parsed.tipo || (material?.tipo);
    return navList.findIndex(m => Number(m?.id) === curId && ((m?.tipo || m?.type) === curType || !curType));
  }, [navList, parsed.id, parsed.tipo, material?.tipo]);
  const currentOrderNumber = React.useMemo(() => {
    if (currentIndex >= 0 && navList[currentIndex]) {
      const o = navList[currentIndex]?.displayOrder ?? navList[currentIndex]?.ordem ?? navList[currentIndex]?.order;
      if (o != null) return o;
      return currentIndex + 1;
    }
  return (material?.ordem ?? material?.order ?? Number(parsed.id)) || 1;
  }, [currentIndex, navList, material?.ordem, material?.order, parsed.id]);
  const hasPrevious = navList.length > 0 ? currentIndex > 0 : Number(parsed.id) > 1;
  const hasNext = navList.length > 0 ? (currentIndex >= 0 && currentIndex < navList.length - 1) : true;
  const handleNextMaterial = () => {
    if (navList.length === 0) {
      const next = Number(parsed.id) + 1; // fallback
      return navigate(`/cursos/${idCurso}/material/${next}`);
    }
    const nextIdx = currentIndex >= 0 ? currentIndex + 1 : -1;
    if (nextIdx >= 0 && nextIdx < navList.length) {
      const n = navList[nextIdx];
      const nextSlug = `${(n?.tipo || n?.type)}-${n?.id}`;
      if (n?.id != null) navigate(`/cursos/${idCurso}/material/${nextSlug}`);
    }
  };
  const handlePreviousMaterial = () => {
    if (navList.length === 0) {
      const prev = Number(parsed.id) - 1; // fallback
      if (prev > 0) navigate(`/cursos/${idCurso}/material/${prev}`);
      return;
    }
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : -1;
    if (prevIdx >= 0) {
      const p = navList[prevIdx];
      const prevSlug = `${(p?.tipo || p?.type)}-${p?.id}`;
      if (p?.id != null) navigate(`/cursos/${idCurso}/material/${prevSlug}`);
    }
  };

  // Finalize helpers
  function getUserIdFromJwtOrStorage() {
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

  async function finalizeMaterialSafe() {
    try {
      const fkUsuario = getUserIdFromJwtOrStorage();
      if (!fkUsuario) {
        console.warn('[StudentMaterialPage] usuarioId ausente; finalize abortado');
        return;
      }
      const fkCurso = Number(String(idCurso || '').trim());
      // garante matrícula antes de finalizar
      try { await ensureMatricula(fkUsuario, fkCurso); } catch (_) {}
      const rawIdMaterialAluno = material?.idMaterialAluno || material?.idMaterialAlunoId;
      const idMaterialAluno = rawIdMaterialAluno != null ? Number(String(rawIdMaterialAluno).trim()) : undefined;

      if (idMaterialAluno) {
        await MaterialAlunoService.finalizarMaterialAluno(idMaterialAluno, fkUsuario, fkCurso);
      } else if (material?.id) {
        const materialIdClean = Number(String(material.id).trim());
        let materialTipoClean = String(material.tipo || '').trim().toLowerCase();
        // backend espera 'apostila' para PDFs
        if (materialTipoClean === 'pdf') materialTipoClean = 'apostila';
        await MaterialAlunoService.finalizarPorMaterial(materialTipoClean, materialIdClean, fkUsuario, fkCurso);
      }

      // Após finalizar, verifica no backend se este material foi marcado como concluído e atualiza apenas se confirmado
      try {
        const idNum = Number(material?.id ?? idMaterial);
        const tipoNormalized = (material?.tipo || '').toString().toLowerCase().includes('video') ? 'video' : 'pdf';
        const verify = await api.get(`/materiais-alunos/listar-por-matricula/${fkUsuario}/${fkCurso}`);
        const arr = Array.isArray(verify?.data) ? verify.data : [];
        
        // Helper to check if concluded
        const isConcludedCheck = (rec) => {
          const truthy = (v) => v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v) === '1';
          return truthy(rec?.finalizado) || truthy(rec?.finalizada);
        };
        
        const concluded = arr.some(rec => {
          const isDone = isConcludedCheck(rec);
          if (!isDone) return false;
          // map ids strictly
          const vid = rec?.fkVideo?.idVideo ?? rec?.fk_video?.id_video ?? rec?.idVideo ?? rec?.videoId ?? rec?.video_id ?? rec?.id_video ?? rec?.fkVideo ?? rec?.fk_video;
          const ap = rec?.fkApostila?.idApostila ?? rec?.fk_apostila?.id_apostila ?? rec?.idApostila ?? rec?.apostilaId ?? rec?.apostila_id ?? rec?.id_apostila ?? rec?.fkApostila ?? rec?.fk_apostila;
          if (tipoNormalized === 'video' && vid != null) return Number(vid) === Number(idNum);
          if (tipoNormalized === 'pdf' && ap != null) return Number(ap) === Number(idNum);
          return false;
        });
        if (concluded) {
          setMaterial(prev => prev ? ({ ...prev, finalizado: true }) : prev);
        }
        
        // Check if ALL materials are now completed
        const completedCount = arr.filter(m => isConcludedCheck(m)).length;
        const totalMaterials = materialsListRef.current.length;
        const allCompleted = completedCount >= totalMaterials && totalMaterials > 0;
        console.log('[StudentMaterialPage] After finalize - completion check:', { completedCount, totalMaterials, allCompleted, materialsListLength: materialsListRef.current.length });
        setAllMaterialsCompleted(allCompleted);
        
        // notifica listagem para refazer fetch (sem UI otimista)
        window.dispatchEvent(new CustomEvent('material:finalizado', { detail: { idCurso: fkCurso } }));
      } catch (_) {
        // mesmo se a verificação falhar, dispare o evento para a lista se atualizar do backend
        window.dispatchEvent(new CustomEvent('material:finalizado', { detail: { idCurso: fkCurso } }));
      }
    } catch (err) {
      console.error('Erro ao finalizar material:', err);
    }
  }

  async function handleFinalizeClick() {
    if (finalizando) return;
    setFinalizando(true);
    await finalizeMaterialSafe();
    setFinalizando(false);
  }

  // TRANSCRIÇÃO: tentamos buscar legendas do YouTube via timedtext (quando disponível)
  async function fetchYouTubeTranscript(ytId) {
    setTranscricaoCarregando(true);
    setTranscricao([]);
    try {
      // 1) Tenta obter lista de trilhas para escolher melhor idioma
      const listUrl = `https://video.google.com/timedtext?type=list&v=${encodeURIComponent(ytId)}`;
      const listResp = await fetch(listUrl);
      let lang = 'pt';
      if (listResp.ok) {
        const xml = await listResp.text();
        // procura lang_code prioritário
        const pref = ['pt-BR', 'pt', 'en'];
        for (const code of pref) {
          const re = new RegExp(`<track[^>]*lang_code=\"${code}\"`, 'i');
          if (re.test(xml)) { lang = code; break; }
        }
      }

      // 2) Baixa a trilha no formato json3 (quando permitido)
      const jsonUrl = `https://video.google.com/timedtext?fmt=json3&lang=${encodeURIComponent(lang)}&v=${encodeURIComponent(ytId)}`;
      let items = [];
      let ok = false;
      try {
        const resp = await fetch(jsonUrl);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.events)) {
            items = data.events
              .filter(ev => Array.isArray(ev.segs))
              .map(ev => ({
                start: ev.tStartMs / 1000,
                dur: (ev.dDurationMs || 0) / 1000,
                text: ev.segs.map(s => s.utf8).join('')
              }));
            ok = items.length > 0;
          }
        }
      } catch (e) {
        // ignora, tenta XML
      }

      if (!ok) {
        const xmlUrl = `https://video.google.com/timedtext?lang=${encodeURIComponent(lang)}&v=${encodeURIComponent(ytId)}`;
        const resp = await fetch(xmlUrl);
        if (resp.ok) {
          const xml = await resp.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(xml, 'application/xml');
          const texts = Array.from(doc.getElementsByTagName('text'));
          items = texts.map(t => ({
            start: Number(t.getAttribute('start') || 0),
            dur: Number(t.getAttribute('dur') || 0),
            text: decodeHTMLEntities(t.textContent || '')
          }));
        }
      }

      setTranscricao(items);
    } catch (e) {
      console.warn('Falha ao buscar transcrição do YouTube (possível CORS ou sem legendas).', e);
      setTranscricao([]);
    } finally {
      setTranscricaoCarregando(false);
    }
  }

  function decodeHTMLEntities(str) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  // Build absolute backend URL for relative paths (e.g., /uploads/...) and auth headers
  function buildAbsoluteUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api?.defaults?.baseURL || '';
    if (!base) return url;
    return `${String(base).replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`;
  }

  // Some backends return 'urlArquivo' (camel) or 'url_arquivo' (snake) for apostilas
  function getPdfUrl(m) {
    if (!m) return '';
    let candidate = m.url || m.urlArquivo || m.url_arquivo || m.arquivoUrl || m.link;
    if (candidate && typeof candidate === 'string') {
      // Se já for uma URL completa (S3 ou outro), retorna diretamente
      if (/^https?:\/\//i.test(candidate)) return candidate;
      return candidate;
    }
    const storageName = m.nomeApostilaArmazenamento || m.nome_apostila_armazenamento;
    if (storageName && typeof storageName === 'string') {
      // Se já for uma URL completa (S3), retorna diretamente
      if (/^https?:\/\//i.test(storageName)) return storageName;
      let clean = storageName.startsWith('/') ? storageName.slice(1) : storageName;
      // Avoid duplicates if value already contains 'uploads/'
      if (/^uploads\//i.test(clean)) {
        return `/${clean}`;
      }
      return `/uploads/${clean}`;
    }
    return '';
  }

  function renderMaterialContent() {
    if (!material) return null;

    if (material.tipo === 'video') {
      const url = getVideoUrl(material);
      if (!url) {
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="text-gray-700">Link do video nao disponivel para este material.</div>
          </div>
        );
      }
      const ytMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);

      if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];

        if (!videoLoaded) {
          const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <SmartImage src={thumb} alt={material.titulo} className="w-full h-full object-cover" />
              <button
                onClick={() => setVideoLoaded(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
                aria-label={`Reproduzir ${material.titulo}`}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-white/90 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-8 h-8">
                    <path d="M5 3v18l15-9L5 3z" />
                  </svg>
                </div>
              </button>
            </div>
          );
        }

        return (
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <div id={ytContainerId} className="w-full h-full" />
            {/* Transcrição */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Transcrição</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="Default"
                    label={transcricaoAtiva ? 'Ocultar' : 'Ativar transcrição'}
                    onClick={() => {
                      const next = !transcricaoAtiva;
                      setTranscricaoAtiva(next);
                      if (next && transcricao.length === 0) fetchYouTubeTranscript(ytId);
                    }}
                  />
                </div>
              </div>
              {transcricaoAtiva && (
                <div className="max-h-64 overflow-auto bg-white border border-gray-100 rounded p-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {transcricaoCarregando ? (
                    <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={16} /> Carregando transcrição...</div>
                  ) : transcricao.length > 0 ? (
                    transcricao.map((t, i) => (
                      <div key={i} className="mb-2">
                        <span className="text-gray-400 mr-2">[{formatTime(t.start)}]</span>
                        <span>{t.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600">
                      Não encontramos legendas públicas para este vídeo ou o navegador bloqueou a requisição (CORS). Abra no YouTube e ative CC para legendas.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
      // fallback para video fora do YouTube
      return (
        <div className="bg-black rounded-lg overflow-hidden">
          <video controls className="w-full aspect-video bg-black" src={url} />
        </div>
      );

    }

    if (material.tipo === 'apostila') {
      const displayTitle = (() => {
        const raw = material?.titulo || material?.nomeApostilaOriginal || material?.nome_apostila_original || '';
        return typeof raw === 'string' && /\.pdf$/i.test(raw) ? raw.replace(/\.pdf$/i, '') : raw;
      })();
      return (
        <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 aspect-video flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-600">
            <FileText size={64} className="mb-4" />
            <p className="text-lg font-medium">{displayTitle || 'Visualizador de PDF'}</p>
            <Button
              variant="Default"
              label="Abrir PDF"
              onClick={() => {
                const url = getPdfUrl(material);
                if (url) {
                  const absUrl = buildAbsoluteUrl(url);
                  window.open(absUrl, '_blank');
                } else {
                  window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', title: 'PDF não disponível' } }));
                }
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  }

  function formatTime(seconds) {
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const m = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
    const h = Math.floor(seconds / 3600);
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-3 sm:px-8 pt-4 sm:pt-13 pb-20">
      <GradientSideRail className="left-10 hidden sm:block" />
      <GradientSideRail className="right-10 hidden sm:block" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-4 sm:mb-8 hidden sm:block">
          <TituloPrincipal>{material ? material.titulo : 'Carregando...'}</TituloPrincipal>
        </div>

        {material?.finalizado && (
          <div className="mb-4 sm:mb-6 flex justify-center sm:justify-start">
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
              <CheckCircle2 size={14} className="mr-1" /> Concluído
            </span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-base sm:text-2xl font-bold text-white leading-tight">
              Material {currentOrderNumber} - {material ? material.titulo : '...'}
            </h2>
            <div className="flex items-center mt-1 sm:mt-2 text-orange-100 text-sm">
              {material ? (material.tipo === 'video' ? <Youtube size={16} className="mr-1.5 flex-shrink-0" /> : <FileText size={16} className="mr-1.5 flex-shrink-0" />) : null}
              <span className="capitalize">{material ? (material.tipo === 'video' ? 'Vídeo' : (material.tipo === 'apostila' ? 'PDF' : material.tipo)) : ''}</span>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-600 py-8"><Loader2 className="animate-spin" size={18} /> Carregando...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-3 sm:p-4 text-red-700">
                <div className="font-semibold mb-2 text-sm sm:text-base">Erro ao carregar material</div>
                <pre className="text-xs whitespace-pre-wrap overflow-x-auto">{error}</pre>
                <div className="mt-3">
                  <Button variant="Default" label="Tentar novamente" onClick={loadMaterial} />
                </div>
              </div>
            ) : (
              renderMaterialContent()
            )}
          </div>

          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Sobre o material:</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{material ? material.descricao : ''}</p>
          </div>

          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Mensagem de conclusão quando todos os materiais foram finalizados */}
              {allMaterialsCompleted && isLastMaterial && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                    <div>
                      <h4 className="text-base font-bold text-green-800">Parabéns! Você concluiu todos os materiais!</h4>
                      <p className="text-sm text-green-700">{hasExam ? 'Clique em "Ir para Avaliação" para realizar a prova.' : 'Você completou todo o conteúdo do curso.'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botão concluir - só mostra se não completou todos ou não é último material */}
              {!(allMaterialsCompleted && isLastMaterial) && (
                <Button
                  variant="Confirm"
                  className="w-full"
                  label={finalizando ? 'Finalizando...' : (material?.finalizado ? 'Concluído ✓' : 'Concluir material')}
                  onClick={handleFinalizeClick}
                  disabled={finalizando || material?.finalizado}
                />
              )}
              
              {/* Navegação anterior/próximo */}
              <div className="flex gap-2">
                <Button
                  variant="Cancel"
                  label="← Anterior"
                  onClick={handlePreviousMaterial}
                  disabled={!hasPrevious}
                  className="flex-1 text-sm"
                />
                {isLastMaterial && allMaterialsCompleted && hasExam ? (
                  <Button
                    variant="Confirm"
                    label="Ir para Avaliação →"
                    onClick={() => navigate(`/cursos/${idCurso}/material/avaliacao`)}
                    className="flex-1 text-sm"
                  />
                ) : (
                  <Button
                    variant="Confirm"
                    label="Próximo →"
                    onClick={handleNextMaterial}
                    disabled={!hasNext}
                    className="flex-1 text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

