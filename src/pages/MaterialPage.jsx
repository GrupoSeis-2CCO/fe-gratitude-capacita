import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import { FileText, Youtube } from 'lucide-react';
import MaterialPageService from "../services/MaterialPageService.js";
import MaterialAlunoService from "../services/MaterialAlunoService.js";
import SmartImage from "../components/SmartImage.jsx";

export default function MaterialPage() {
  const { idCurso, idMaterial } = useParams();
  const navigate = useNavigate();

  // support idMaterial formats like "video-5" or "pdf-3" (student routes use type-id)
  const parsedParam = (() => {
    const raw = String(idMaterial || '');
    if (raw.includes('-')) {
      const [maybeType, maybeId] = raw.split('-');
      const num = Number(maybeId);
      if (!Number.isNaN(num)) return { typePrefix: maybeType, idNum: num };
    }
    const num = Number(raw);
    return { typePrefix: null, idNum: Number.isNaN(num) ? null : num };
  })();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [materialsList, setMaterialsList] = useState([]);

  async function loadMaterial() {
    setLoading(true);
    setError(null);
    try {
  const idNum = parsedParam.idNum ?? parseInt(idMaterial);
  const res = await MaterialPageService.getMaterialDoCurso(parseInt(idCurso), Number(idNum));
      setMaterial(res);
    } catch (err) {
      // prefer the server-provided JSON error body when available
      const serverData = err?.response?.data;
      if (serverData) {
        setError(JSON.stringify(serverData, null, 2));
      } else {
        setError(err.message || String(err));
      }
      setMaterial(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterial();
  }, [idCurso, idMaterial]);

  // Carregar lista para obter ordem global e manter numeração estável mesmo com filtros
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getMateriaisPorCurso } = await import('../services/MaterialListPageService.js');
        const resp = await getMateriaisPorCurso(idCurso);
        let arr = [];
        if (Array.isArray(resp)) arr = resp; else if (resp?.materiais) arr = resp.materiais; else if (resp?.data && Array.isArray(resp.data)) arr = resp.data; else if (resp) arr = [resp];
        const onlyMaterials = (arr || []).filter(m => (m?.tipo || m?.type) !== 'avaliacao');
        // map to the same shape MaterialsListPage uses so ordering and ids match exactly
        const mapped = onlyMaterials.map((m, idx) => {
          const type = m.tipo === 'video' ? 'video' : (m.tipo === 'apostila' ? 'pdf' : 'avaliacao');
          const rawTitle = m.titulo ?? m.nomeApostila ?? m.nomeVideo ?? `Material ${m.id ?? idx}`;
          const cleanTitle = typeof rawTitle === 'string' && /\.pdf$/i.test(rawTitle) ? rawTitle.replace(/\.pdf$/i, '') : rawTitle;
          const finalTitle = type === 'pdf' ? cleanTitle : rawTitle;
          return ({
            ...m,
            id: m.id ?? m.idApostila ?? m.idVideo ?? m.idMaterial ?? idx,
            title: finalTitle,
            type,
            description: m.descricao ?? m.descricaoApostila ?? m.descricaoVideo ?? '',
            url: m.url ?? m.urlArquivo ?? m.urlVideo ?? null,
            hidden: (typeof m.isApostilaOculto !== 'undefined') ? (m.isApostilaOculto === 1) : (typeof m.isVideoOculto !== 'undefined' ? (m.isVideoOculto === 1) : false),
            order: m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? (idx + 1),
            __idx: idx
          });
        });
        mapped.sort((a, b) => {
          const ao = Number(a.order ?? Number.MAX_SAFE_INTEGER);
          const bo = Number(b.order ?? Number.MAX_SAFE_INTEGER);
          if (ao !== bo) return ao - bo;
          const weight = (t) => (t === 'video' || t === 'video' ? 0 : (t === 'apostila' || t === 'pdf' ? 1 : 2));
          return weight(a.tipo || a.type) - weight(b.tipo || b.type);
        });
        // sort by order asc, within same order prefer videos then pdfs (same tie-breaker as MaterialsListPage)
        mapped.sort((a, b) => {
          const oa = Number(a.order || 0), ob = Number(b.order || 0);
          if (oa !== ob) return oa - ob;
          const weight = (t) => t === 'video' ? 0 : (t === 'pdf' ? 1 : 2);
          return weight(a.type) - weight(b.type);
        });
        const withDisplay = mapped.map((m, i) => ({ ...m, displayOrder: i + 1 }));
        if (mounted) setMaterialsList(withDisplay.map(({ __idx, ...m }) => m));
      } catch (_) {}
    })();
    return () => { mounted = false };
  }, [idCurso]);

  // reset videoLoaded when the material changes (so thumbnails show for new materials)
  useEffect(() => {
    setVideoLoaded(false);
  }, [idMaterial, idCurso]);

  const ytPlayerRef = useRef(null);
  const ytContainerId = `yt-player-${idCurso}-${idMaterial}`;
  const finalizedRef = useRef(false);

  // load YouTube IFrame API once and return a promise that resolves when ready
  function loadYouTubeIframeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const existing = document.getElementById('youtube-iframe-api');
      if (existing) {
        // wait for global ready
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(check);
            resolve(window.YT);
          }
        }, 50);
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'youtube-iframe-api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = function() {
        resolve(window.YT);
      };
    });
  }

  // initialize/destroy YouTube player when videoLoaded toggles for a YouTube material
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

      // destroy existing player if any
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new YT.Player(ytContainerId, {
        videoId: ytId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onStateChange: async (event) => {
            // YT.PlayerState.ENDED === 0
            if (event.data === 0) {
              // finalize once per material view
              if (!finalizedRef.current) {
                finalizedRef.current = true;
                try {
                  // defensive parsing: trim any stray whitespace/newlines coming from route params or data
                  const fkUsuario = Number(String(localStorage.getItem('usuarioId') || '').trim()) || 1; // replace with auth user id
                  const fkCurso = Number(String(idCurso || '').trim());
                  const rawIdMaterialAluno = material?.idMaterialAluno || material?.idMaterialAlunoId;
                  const idMaterialAluno = rawIdMaterialAluno != null ? Number(String(rawIdMaterialAluno).trim()) : undefined;

                  // Debug logging to help trace finalize requests
                  console.debug('[MaterialPage] attempting finalize', {
                    idMaterialAluno,
                    materialId: material?.id,
                    materialTipo: material?.tipo,
                    fkUsuario,
                    fkCurso
                  });

                  if (idMaterialAluno) {
                    const res = await MaterialAlunoService.finalizarMaterialAluno(idMaterialAluno, fkUsuario, fkCurso);
                    // update state with returned id (ensure future calls use the id route)
                    if (res && res.idMaterialAlunoComposto && res.idMaterialAlunoComposto.idMaterialAluno) {
                      setMaterial(prev => prev ? ({ ...prev, finalizado: true, idMaterialAluno: res.idMaterialAlunoComposto.idMaterialAluno }) : prev);
                    }
                  } else if (material && material.id) {
                    // ensure material.id and material.tipo are sanitized
                    const materialIdClean = Number(String(material.id).trim());
                    const materialTipoClean = String(material.tipo || '').trim();
                    const res = await MaterialAlunoService.finalizarPorMaterial(materialTipoClean, materialIdClean, fkUsuario, fkCurso);
                    if (res && res.idMaterialAlunoComposto && res.idMaterialAlunoComposto.idMaterialAluno) {
                      setMaterial(prev => prev ? ({ ...prev, finalizado: true, idMaterialAluno: res.idMaterialAlunoComposto.idMaterialAluno }) : prev);
                    }
                  } else {
                    console.warn('Não foi possível determinar id para finalizar o material ao término do vídeo');
                  }
                  // ensure finalizado in state in any case (above already sets finalizado when res present)
                  setMaterial(prev => prev ? ({ ...prev, finalizado: true }) : prev);
                } catch (err) {
                  console.error('Erro ao marcar material como concluído ao término do vídeo', err);
                }
              }

              // destroy player and show thumbnail again to avoid related recommendations
              try { ytPlayerRef.current.destroy(); } catch (e) {}
              ytPlayerRef.current = null;
              if (mounted) setVideoLoaded(false);
            }
          }
        }
      });
    }

    initPlayer();

    return () => {
      mounted = false;
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [videoLoaded, material]);

  // helper to match a material record by various possible id fields
  const matchesMaterialId = (m, num) => {
    if (m == null || num == null) return false;
    const n = Number(num);
    return (
      Number(m.id) === n ||
      Number(m.idApostila || 0) === n ||
      Number(m.idVideo || 0) === n ||
      Number(m.idMaterial || 0) === n ||
      Number(m.fkApostila?.idApostila || m.fk_apostila?.idApostila || 0) === n ||
      Number(m.fkVideo?.idVideo || m.fk_video?.idVideo || 0) === n
    );
  };

  const handleNextMaterial = () => {
    const idNum = parsedParam.idNum ?? Number(idMaterial);
    const list = materialsList || [];
    const idx = list.findIndex(m => matchesMaterialId(m, idNum) && (() => {
      if (!parsedParam.typePrefix) return true;
      const want = (parsedParam.typePrefix || '').toLowerCase() === 'pdf' ? 'apostila' : (parsedParam.typePrefix || '').toLowerCase();
      const t = (m?.tipo || m?.type || '').toLowerCase();
      return t.includes(want);
    })());
    if (idx >= 0 && idx + 1 < list.length) {
      const next = list[idx + 1];
      const seg = (next?.tipo || next?.type) ? `${(next?.tipo || next?.type)}-${next.id ?? next.idVideo ?? next.idApostila}` : `${next.id ?? next.idVideo ?? next.idApostila}`;
      navigate(`/cursos/${idCurso}/material/${seg}`);
    }
  };

  const handlePreviousMaterial = () => {
    const idNum = parsedParam.idNum ?? Number(idMaterial);
    const list = materialsList || [];
    const idx = list.findIndex(m => matchesMaterialId(m, idNum) && (() => {
      if (!parsedParam.typePrefix) return true;
      const want = (parsedParam.typePrefix || '').toLowerCase() === 'pdf' ? 'apostila' : (parsedParam.typePrefix || '').toLowerCase();
      const t = (m?.tipo || m?.type || '').toLowerCase();
      return t.includes(want);
    })());
    if (idx > 0) {
      const prev = list[idx - 1];
      const seg = (prev?.tipo || prev?.type) ? `${(prev?.tipo || prev?.type)}-${prev.id ?? prev.idVideo ?? prev.idApostila}` : `${prev.id ?? prev.idVideo ?? prev.idApostila}`;
      navigate(`/cursos/${idCurso}/material/${seg}`);
    }
  };

  // helpers to compute display number by total ordering (index in materialsList)
  function getDisplayPosition() {
    const list = materialsList || [];
    const idNum = parsedParam.idNum ?? Number(idMaterial);
    // prefer exact type match when route provides type prefix
    const idx = list.findIndex(m => matchesMaterialId(m, idNum) && (() => {
      if (!parsedParam.typePrefix) return true;
      const want = (parsedParam.typePrefix || '').toLowerCase() === 'pdf' ? 'apostila' : (parsedParam.typePrefix || '').toLowerCase();
      const t = (m?.tipo || m?.type || '').toLowerCase();
      return t.includes(want);
    })());
    return { index: idx, total: list.length };
  }

  function renderMaterialContent() {
    if (!material) return null;

    if (material.tipo === "video") {
      const url = material.url || '';
      const ytMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);

      if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];

        // click-to-load thumbnail
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

        // when videoLoaded is true, show the YT player container (player is created by useEffect)
        return (
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <div id={ytContainerId} className="w-full h-full" />
          </div>
        );
      }

      if (url.includes('vimeo.com')) {
        if (!videoLoaded) {
          return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <Youtube size={64} className="mb-4" />
                <Button variant="Default" label="Reproduzir vídeo" onClick={() => setVideoLoaded(true)} />
              </div>
            </div>
          );
        }

        return (
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <iframe
              title={material.titulo}
              src={url.replace('vimeo.com', 'player.vimeo.com/video')}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // fallback video placeholder
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
      const displayTitle = (() => {
        const raw = material?.titulo || '';
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
                if (material.url) {
                  window.open(material.url, '_blank');
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

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-8">
            <TituloPrincipal>{(() => {
              const { index } = getDisplayPosition();
              const num = index >= 0 ? (index + 1) : (parsedParam.idNum ?? 1);
              const rawTitle = material ? (material.titulo ?? material.nomeApostila ?? material.nomeVideo ?? '...') : '...';
              const cleanTitle = typeof rawTitle === 'string' && /\.pdf$/i.test(rawTitle) ? rawTitle.replace(/\.pdf$/i, '') : rawTitle;
              return `Material ${num} - ${cleanTitle}`;
            })()}</TituloPrincipal>
          </div>

        {/* Back button removido; agora padronizado via BackButton no nível de rota */}

        <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-2xl font-bold text-white">
                {(() => {
                  const { index } = getDisplayPosition();
                  const num = index >= 0 ? (index + 1) : (parsedParam.idNum ?? 1);
                  const rawTitle = material ? (material.titulo ?? material.nomeApostila ?? material.nomeVideo ?? '...') : '...';
                  const cleanTitle = typeof rawTitle === 'string' && /\.pdf$/i.test(rawTitle) ? rawTitle.replace(/\.pdf$/i, '') : rawTitle;
                  return `Material ${num} - ${cleanTitle}`;
                })()}
            </h2>
            <div className="flex items-center mt-2 text-orange-100">
              {material ? (material.tipo === 'video' ? <Youtube size={20} className="mr-2" /> : <FileText size={20} className="mr-2" />) : null}
              <span className="capitalize">{material ? (material.tipo === 'video' ? 'video' : (material.tipo === 'apostila' ? 'pdf' : material.tipo)) : ''}</span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div>Carregando...</div>
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
            <p className="text-gray-600 leading-relaxed">
              {material ? material.descricao : ''}
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Button
                  variant="Cancel"
                  label="Material Anterior"
                  onClick={handlePreviousMaterial}
                  disabled={material && material.id <= 1}
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
  );
}
