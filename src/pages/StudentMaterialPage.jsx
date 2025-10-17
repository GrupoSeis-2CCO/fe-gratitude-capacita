import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import GradientSideRail from "../components/GradientSideRail.jsx";
import SmartImage from "../components/SmartImage.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import { FileText, Youtube, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import MaterialPageService from "../services/MaterialPageService.js";
import MaterialAlunoService from "../services/MaterialAlunoService.js";
import { ensureMatricula } from "../services/MatriculaService.js";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../services/api.js";

// Student view of a single material with backend integration, transcript and PDF rendering
export default function StudentMaterialPage() {
  const { idCurso, idMaterial } = useParams();
  const navigate = useNavigate();
  const { getCurrentUserType, isLoggedIn } = useAuth?.() || { getCurrentUserType: () => undefined, isLoggedIn: () => true };
  const userType = getCurrentUserType?.();

  // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
  if (isLoggedIn?.() === false || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [material, setMaterial] = useState(null);
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
      const res = await MaterialPageService.getMaterialDoCurso(parseInt(idCurso), parseInt(idMaterial));
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

  useEffect(() => { loadMaterial(); }, [idCurso, idMaterial]);
  useEffect(() => { setVideoLoaded(false); finalizedRef.current = false; }, [idMaterial, idCurso]);

  // Garante matrícula ao abrir a página do material (evita 404 na listagem/finalização)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuarioId');
      const fkUsuario = raw ? Number(String(raw).trim()) : undefined;
      const fkCurso = Number(String(idCurso || '').trim());
      if (fkUsuario && fkCurso) {
        ensureMatricula(fkUsuario, fkCurso).catch(() => {});
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
  const handleNextMaterial = () => { const next = (material?.id ? material.id + 1 : Number(idMaterial) + 1); navigate(`/cursos/${idCurso}/material/${next}`); };
  const handlePreviousMaterial = () => { const prev = (material?.id ? material.id - 1 : Number(idMaterial) - 1); if (prev > 0) navigate(`/cursos/${idCurso}/material/${prev}`); };

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
  const pdfCanvasRef = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

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

  async function renderPdf(url) {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const pdfjsLib = await ensurePdfJsLoaded();
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      // render primeira página
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.error('Erro ao renderizar PDF:', e);
      setPdfError('Não foi possível carregar o PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  useEffect(() => {
    // quando tipo for apostila, tenta renderizar automaticamente
    if (material?.tipo === 'apostila' && material?.url) {
      renderPdf(material.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.tipo, material?.url]);

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
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-red-600" />
                <span className="text-sm font-medium">{material.titulo}.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="Default"
                  label="Baixar PDF"
                  onClick={() => {
                    if (!material.url) return;
                    const link = document.createElement('a');
                    link.href = material.url; link.download = `${material.titulo}.pdf`;
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                  }}
                />
                <Button
                  variant="Confirm"
                  label="Abrir em nova aba"
                  onClick={() => material?.url && window.open(material.url, '_blank')}
                />
              </div>
            </div>
            <div className="w-full overflow-auto flex items-center justify-center bg-gray-50" style={{ minHeight: 480 }}>
              {pdfLoading ? (
                <div className="flex items-center gap-2 text-gray-500 py-12"><Loader2 className="animate-spin" size={18} /> Carregando PDF...</div>
              ) : pdfError ? (
                <div className="text-red-600 py-12">{pdfError}</div>
              ) : (
                <canvas ref={pdfCanvasRef} className="shadow rounded" />
              )}
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
              Material {idMaterial} - {material ? material.titulo : '...'}
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
