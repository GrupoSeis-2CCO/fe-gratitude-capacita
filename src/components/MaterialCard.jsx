import React, { useRef, useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { FileText, Youtube } from 'lucide-react';
import MaterialService from '../services/MaterialService.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function MaterialCard({ material, index, onEdit = null, onActionComplete = null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // when material is a video, try to resolve a thumbnail image
  useEffect(() => {
    setThumbnailUrl(null);
    if (!material || material.type !== 'video' || !material.url) return;

    const url = material.url;

    // helper to extract YouTube ID
    function extractYouTubeId(u) {
      try {
        // handle youtu.be/<id>
        const byId = u.match(/(?:youtu\.be\/)([\w-]{11})/);
        if (byId && byId[1]) return byId[1];
        // handle watch?v= and embed
        const vId = u.match(/[?&]v=([\w-]{11})/) || u.match(/embed\/([\w-]{11})/);
        if (vId && vId[1]) return vId[1];
      } catch (e) {
        return null;
      }
      return null;
    }

    const ytId = extractYouTubeId(url);
    if (ytId) {
      // fast static thumbnail URL
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      return;
    }

    // try Vimeo oEmbed for thumbnail
    if (url.includes('vimeo.com')) {
      const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      fetch(oembed)
        .then(res => res.json())
        .then(data => {
          if (data && data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
        })
        .catch(() => {
          // ignore errors and keep thumbnail null
        });
    }
  }, [material]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDeleteConfirmed() {
    setLoading(true);
    try {
      if (material.type === 'pdf') {
        await MaterialService.deleteApostila(material.id);
      } else if (material.type === 'video') {
        await MaterialService.deleteVideo(material.id);
      }
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Erro ao deletar material', err);
      alert('Erro ao deletar material: ' + (err?.response?.data || err.message));
    } finally {
      setLoading(false);
      setOpen(false);
      setConfirmOpen(false);
    }
  }

  async function handleToggleHidden() {
    setLoading(true);
    try {
      if (material.type === 'pdf') {
        await MaterialService.toggleApostilaHidden(material.id);
      } else if (material.type === 'video') {
        await MaterialService.toggleVideoHidden(material.id);
      }
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Erro ao alternar visibilidade', err);
      alert('Erro ao alternar visibilidade: ' + (err?.response?.data || err.message));
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  function handleEdit() {
    setOpen(false);
    if (onEdit) onEdit(material);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex gap-6 mb-6">
      <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {material.type === 'pdf' ? (
          <FileText size={48} className="text-gray-500" />
        ) : (
          thumbnailUrl ? (
            <img src={thumbnailUrl} alt={material.title} className="w-full h-full object-cover" />
          ) : (
            <Youtube size={48} className="text-red-600" />
          )
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Material {index + 1} - {material.title}
          </h3>
          <div className="relative" ref={ref}>
            <button className="text-gray-500 hover:text-gray-800" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
              <MoreHorizontal size={24} />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={handleEdit} disabled={loading}>Editar</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => setConfirmOpen(true)} disabled={loading}>Excluir</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={handleToggleHidden} disabled={loading}>{material.hidden ? 'Tornar visível' : 'Ocultar'}</button>
              </div>
            )}
            <ConfirmModal open={confirmOpen} title="Excluir material" message={`Deseja realmente excluir \"${material.title}\"? Esta ação não pode ser desfeita.`} onCancel={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirmed} confirmLabel="Excluir" cancelLabel="Cancelar" />
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          {material.description}
        </p>
      </div>
    </div>
  );
}
