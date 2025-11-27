import React, { useRef, useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { FileText, Youtube, ClipboardList, Star } from "lucide-react";
import SmartImage from "./SmartImage.jsx";
import { api } from "../services/api.js";
import MaterialService from "../services/MaterialService.js";
import ConfirmModal from "./ConfirmModal.jsx";

export default function MaterialCard({ material, index, onEdit = null, onActionComplete = null, onClick = undefined }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    setThumbnailUrl(null);
    if (!material || material.type !== "video" || !material.url) return;

    const url = material.url;

    function extractYouTubeId(u) {
      try {
        const byId = u.match(/(?:youtu\.be\/)([\w-]{11})/);
        if (byId && byId[1]) return byId[1];
        const vId = u.match(/[?&]v=([\w-]{11})/) || u.match(/embed\/([\w-]{11})/);
        if (vId && vId[1]) return vId[1];
      } catch (e) {
        return null;
      }
      return null;
    }

    const ytId = extractYouTubeId(url);
    if (ytId) {
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      return;
    }

    if (url.includes("vimeo.com")) {
      const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      fetch(oembed)
        .then(res => res.json())
        .then(data => {
          if (data && data.thumbnail_url) {
            const apiBase = api?.defaults?.baseURL || "";
            const proxied = apiBase ? `${apiBase}/proxy/image?url=${encodeURIComponent(data.thumbnail_url)}` : data.thumbnail_url;
            setThumbnailUrl(proxied);
          }
        })
        .catch(() => {
        });
    }
  }, [material]);

  async function handleDeleteConfirmed() {
    setLoading(true);
    try {
      if (material.type === "pdf") {
        await MaterialService.deleteApostila(material.id);
      } else if (material.type === "video") {
        await MaterialService.deleteVideo(material.id);
      }
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error("Erro ao deletar material", err);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Erro ao excluir material', message: String(err?.response?.data || err?.message || err) } }));
    } finally {
      setLoading(false);
      setOpen(false);
      setConfirmOpen(false);
    }
  }

  function handleEdit() {
    setOpen(false);
    if (onEdit) onEdit(material);
  }

  const isAvaliacao = (material?.type === "avaliacao" || material?.tipo === "avaliacao");
  const bgClass = isAvaliacao ? "bg-orange-50 border-orange-300" : "bg-slate-100 border-slate-300";

  function handleRootClick(e) {
    if (open || confirmOpen || loading) {
      e.stopPropagation();
      return;
    }
    if (onClick) onClick();
  }

  return (
    <div
      className={`${bgClass} border rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 mb-6 transition transform hover:-translate-y-1 hover:shadow-xl ${onClick ? "cursor-pointer" : ""}`}
      onClick={handleRootClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="w-full md:w-48 h-48 md:h-32 bg-zinc-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
        {isAvaliacao ? (
          <div className="flex flex-col items-center justify-center">
            <ClipboardList size={44} className="text-orange-600" />
            <span className="mt-1 text-xs font-semibold text-orange-700 uppercase tracking-wide">Avaliacao</span>
          </div>
        ) : material.type === "pdf" ? (
          <FileText size={48} className="text-gray-500" />
        ) : (
          thumbnailUrl ? (
            <SmartImage src={thumbnailUrl} alt={material.title} className="w-full h-full object-cover" />
          ) : (
            <Youtube size={48} className="text-red-600" />
          )
        )}
      </div>
      <div className="flex-1 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-start gap-5">
          <h3 className={`text-2xl font-bold flex-1 ${isAvaliacao ? 'text-orange-800' : 'text-gray-900'}`}>
            {isAvaliacao ? `Avaliacao - ${material.title || 'Avaliacao'}` : `Material ${material?.displayOrder ?? material?.order ?? (index + 1)} - ${material.title}`}
          </h3>
          {!isAvaliacao && (
            <div className="relative flex-shrink-0" ref={ref}>
              <button className="text-gray-500 hover:text-gray-800" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
                <MoreHorizontal size={24} />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50" onClick={(e) => e.stopPropagation()}>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); handleEdit(); }} disabled={loading}>Editar</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }} disabled={loading}>Excluir</button>
                </div>
              )}
              <ConfirmModal open={confirmOpen} title="Excluir material" message={`Deseja realmente excluir \"${material.title}\"? Esta acao nao pode ser desfeita.`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirmed} confirmLabel="Excluir" cancelLabel="Cancelar" />
            </div>
          )}
        </div>
        <p className={`text-lg ${isAvaliacao ? 'text-orange-800' : 'text-gray-600'}`}>
          {material.description}
        </p>
        {isAvaliacao && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold uppercase tracking-wide">
            <Star size={14} className="text-orange-600" /> Avaliacao do Curso
          </div>
        )}
      </div>
    </div>
  );
}
