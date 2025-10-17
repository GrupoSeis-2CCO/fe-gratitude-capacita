import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import GradientSideRail from "../components/GradientSideRail.jsx";
import SmartImage from "../components/SmartImage.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import { FileText, Youtube, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [materialsList, setMaterialsList] = useState([]); // lista para navegação correta
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [transcricaoAtiva, setTranscricaoAtiva] = useState(false);
  const [transcricaoCarregando, setTranscricaoCarregando] = useState(false);
  const [transcricao, setTranscricao] = useState([]); // array de { start, dur, text }

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
      setMaterial(res);
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
        if (mounted) setMaterialsList(normalized);
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
        const concluded = arr.some(rec => {
          const truthy = (v) => v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v) === '1';
          const isDone = truthy(rec?.finalizado) || truthy(rec?.finalizada);
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

  // PDF.js via CDN (sem instalar pacotes)
  // Inline PDF viewer (multi-page) using pdf.js
  const pdfContainerRef = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfScale, setPdfScale] = useState(1.1);
  const pdfCurrentUrlRef = useRef('');

  // Build absolute backend URL for relative paths (e.g., /uploads/...) and auth headers
  function buildAbsoluteUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api?.defaults?.baseURL || '';
    if (!base) return url;
    return `${String(base).replace(/\/$/, '')}/${String(url).replace(/^\//, '')}`;
  }
  function getAuthHeaders() {
    try {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (_) {
      return {};
    }
  }

  // Some backends return 'urlArquivo' (camel) or 'url_arquivo' (snake) for apostilas
  function getPdfUrl(m) {
    if (!m) return '';
    let candidate = m.url || m.urlArquivo || m.url_arquivo || m.arquivoUrl || m.link;
    if (candidate && typeof candidate === 'string') return candidate;
    const storageName = m.nomeApostilaArmazenamento || m.nome_apostila_armazenamento;
    if (storageName && typeof storageName === 'string') {
      let clean = storageName.startsWith('/') ? storageName.slice(1) : storageName;
      // Avoid duplicates if value already contains 'uploads/'
      if (/^uploads\//i.test(clean)) {
        return `/${clean}`;
      }
      return `/uploads/${clean}`;
    }
    return '';
  }

  async function ensurePdfJsLoaded() {
    if (window.pdfjsLib) return window.pdfjsLib;
    await injectScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    // set worker
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return window.pdfjsLib;
  }

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { existing.addEventListener('load', () => resolve()); return resolve(); }
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = () => resolve(); s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  async function renderPdf(url, attempt = 0, scale = pdfScale) {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const pdfjsLib = await ensurePdfJsLoaded();
      const absUrl = buildAbsoluteUrl(url);
      // Fetch the PDF as a Blob (with Authorization if present) to avoid CORS/credentials issues
      const resp = await fetch(absUrl, { headers: { ...getAuthHeaders() } });
      if (!resp.ok) throw new Error(`Falha ao buscar PDF (${resp.status})`);
      const arrayBuffer = await resp.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Ensure container exists
      const container = pdfContainerRef.current;
      if (!container) {
        if (attempt < 3) {
          setTimeout(() => renderPdf(url, attempt + 1, scale), 150);
        } else {
          throw new Error('Container não disponível para renderização do PDF.');
        }
        return;
      }

      // Clear previous content
      while (container.firstChild) container.removeChild(container.firstChild);

      // Render all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const wrapper = document.createElement('div');
        wrapper.style.margin = '12px 0';
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        const canvas = document.createElement('canvas');
        canvas.className = 'shadow rounded bg-white';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    } catch (e) {
      console.error('Erro ao renderizar PDF:', e);
      setPdfError('Não foi possível carregar o PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  // Robust PDF open/download actions
  async function handlePdfOpenNewTab() {
    const url = buildAbsoluteUrl(getPdfUrl(material));
    if (!url) return;
    // Se for mesma origem, abrir direto é mais confiável
    try {
      const u = new URL(url);
      if (u.origin === window.location.origin || url.startsWith(api?.defaults?.baseURL || '')) {
        window.open(url, '_blank', 'noopener');
        return;
      }
    } catch (_) { /* ignore */ }

    // Caso contrário, abre janela e redireciona via Blob para evitar CORS
    const newWin = window.open('', '_blank');
    if (!newWin) {
      setPdfError('Pop-up bloqueado pelo navegador. Autorize pop-ups para abrir em nova aba.');
      return;
    }
    newWin.document.write('<p style="font-family: sans-serif; color: #444;">Abrindo PDF...</p>');
    newWin.document.close();
    try {
      const resp = await fetch(url, { headers: { ...getAuthHeaders() } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      newWin.opener = null;
      newWin.location.href = objectUrl;
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (e) {
      console.error('Falha ao abrir PDF em nova aba:', e);
      // fallback: tentar abrir diretamente a URL
      try { newWin.location.href = url; } catch (_) {}
      setPdfError('Não foi possível abrir via Blob; tentando abrir diretamente.');
    }
  }

  async function handlePdfDownload() {
    try {
      const url = buildAbsoluteUrl(getPdfUrl(material));
      if (!url) return;
      const resp = await fetch(url, { headers: { ...getAuthHeaders() } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      // Prefer original filename from backend or derive from URL
      const originalName = material?.nomeApostilaOriginal || material?.nome_apostila_original || (() => {
        try {
          const u = new URL(url);
          const last = u.pathname.split('/').pop() || '';
          return decodeURIComponent(last);
        } catch (_) { return ''; }
      })();
      const baseName = (originalName || material?.titulo || 'apostila').replace(/[^a-z0-9-_.]+/gi, '_');
      const safeName = baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`;
      a.href = dlUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 60_000);
    } catch (e) {
      console.error('Falha ao baixar PDF:', e);
      // fallback para tentativa de download direto (mesma origem)
      try {
        const url = buildAbsoluteUrl(getPdfUrl(material));
        const a = document.createElement('a');
        const originalName = material?.nomeApostilaOriginal || material?.nome_apostila_original || 'apostila.pdf';
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (_) {
        setPdfError('Não foi possível baixar o PDF.');
      }
    }
  }

  useEffect(() => {
    // quando tipo for apostila, renderiza automaticamente dentro da página
    if (material?.tipo === 'apostila') {
      const pdfUrl = getPdfUrl(material);
      if (pdfUrl) {
        pdfCurrentUrlRef.current = pdfUrl;
        renderPdf(pdfUrl, 0, pdfScale);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.tipo, material?.url, material?.urlArquivo, material?.url_arquivo, material?.nomeApostilaArmazenamento, material?.nome_apostila_armazenamento]);

  // Re-render on zoom changes
  useEffect(() => {
    if (material?.tipo === 'apostila' && pdfCurrentUrlRef.current) {
      renderPdf(pdfCurrentUrlRef.current, 0, pdfScale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfScale]);

  function renderMaterialContent() {
    if (!material) return null;

    if (material.tipo === 'video') {
      const url = material.url || '';
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

      // fallback
      return (
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <Youtube size={64} className="text-red-600 mb-4" />
              <p className="text-lg">Player de Vídeo</p>
            </div>
          </div>
        </div>
      );
    }

    if (material.tipo === 'apostila') {
      const displayName = (() => {
        const raw = material?.nomeApostilaOriginal || material?.nome_apostila_original || material?.titulo || '';
        const name = String(raw);
        return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
      })();
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-red-600" />
                <span className="text-sm font-medium">{displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom controls for inline viewer */}
                <div className="flex items-center gap-2 mr-2">
                  <Button variant="Default" label="-" onClick={() => setPdfScale(s => Math.max(0.6, Number((s - 0.1).toFixed(2))))} />
                  <span className="text-sm text-gray-600 min-w-[48px] text-center">{Math.round(pdfScale * 100)}%</span>
                  <Button variant="Default" label="+" onClick={() => setPdfScale(s => Math.min(2.0, Number((s + 0.1).toFixed(2))))} />
                </div>
                <Button
                  variant="Default"
                  label="Baixar PDF"
                  onClick={handlePdfDownload}
                />
                <Button
                  variant="Confirm"
                  label="Abrir em nova aba"
                  onClick={handlePdfOpenNewTab}
                />
              </div>
            </div>
            <div className="relative w-full overflow-auto bg-gray-50" style={{ minHeight: 480 }}>
              {pdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-500 bg-white/70 rounded px-3 py-2"><Loader2 className="animate-spin" size={18} /> Carregando PDF...</div>
                </div>
              )}
              {pdfError && (
                <div className="p-4">
                  <div className="text-red-600 mb-3">{pdfError}</div>
                  <Button variant="Default" label="Tentar novamente" onClick={() => {
                    if (pdfCurrentUrlRef.current) renderPdf(pdfCurrentUrlRef.current, 0, pdfScale);
                  }} />
                </div>
              )}
              <div ref={pdfContainerRef} className="w-full max-w-full flex flex-col items-center px-2 py-4" />
            </div>
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
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-8">
          <TituloPrincipal>{material ? material.titulo : 'Carregando...'}</TituloPrincipal>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(`/cursos/${idCurso}/material`)}
            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar aos materiais
          </button>

          {material?.finalizado && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle2 size={16} className="mr-1" /> Concluído
            </span>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-2xl font-bold text-white">
              Material {currentOrderNumber} - {material ? material.titulo : '...'}
            </h2>
            <div className="flex items-center mt-2 text-orange-100">
              {material ? (material.tipo === 'video' ? <Youtube size={20} className="mr-2" /> : <FileText size={20} className="mr-2" />) : null}
              <span className="capitalize">{material ? (material.tipo === 'video' ? 'video' : (material.tipo === 'apostila' ? 'pdf' : material.tipo)) : ''}</span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600"><Loader2 className="animate-spin" size={18} /> Carregando...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                <div className="font-semibold mb-2">Erro ao carregar material</div>
                <pre className="text-xs whitespace-pre-wrap">{error}</pre>
                <div className="mt-3">
                  <Button variant="Default" label="Tentar novamente" onClick={loadMaterial} />
                </div>
              </div>
            ) : (
              renderMaterialContent()
            )}
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sobre o material:</h3>
            <p className="text-gray-600 leading-relaxed">{material ? material.descricao : ''}</p>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Button
                variant="Cancel"
                label="Material Anterior"
                onClick={handlePreviousMaterial}
                disabled={material && material.id <= 1}
              />

              <div className="flex items-center gap-4">
                <Button
                  variant="Confirm"
                  label={finalizando ? 'Finalizando...' : (material?.finalizado ? 'Concluído' : 'Concluir material')}
                  onClick={handleFinalizeClick}
                  disabled={finalizando || material?.finalizado}
                />
                <Button
                  variant="Confirm"
                  label="Próximo Material"
                  onClick={handleNextMaterial}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
