import React, { useState, useEffect } from 'react';
import Button from './Button';
import { uploadFileToS3, uploadApostilaToS3, createVideoCommand, createApostilaCommand, updateApostilaUrl, updateApostila, updateVideo } from '../services/UploadService.js';
import { useParams } from 'react-router-dom';

export default function AddMaterialSection({ cursoId: propCursoId = null, onAdded = null, initialMaterial = null, onCancelEdit = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [materialType, setMaterialType] = useState('pdf'); // 'pdf' or 'video'

  // form fields
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [file, setFile] = useState(null);
  const [urlVideo, setUrlVideo] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const params = useParams();
  const idCursoFromParams = params.idCurso ?? params.id ?? null;
  const cursoId = propCursoId || idCursoFromParams || 1;

  useEffect(() => {
    let mounted = true;
    async function fetchPreview() {
      setVideoPreview(null);
      setPreviewError(null);
      if (!urlVideo || urlVideo.trim().length === 0) return;
      setLoadingPreview(true);
      try {
        // try YouTube oEmbed
        const yt = `https://www.youtube.com/oembed?url=${encodeURIComponent(urlVideo)}&format=json`;
        const vimeo = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(urlVideo)}`;
        let resp = await fetch(yt);
        if (!resp.ok) {
          resp = await fetch(vimeo);
        }
        if (!resp.ok) {
          if (mounted) setPreviewError('Preview não disponível para esta URL.');
          return;
        }
        const data = await resp.json();
        if (mounted) setVideoPreview(data);
      } catch (err) {
        if (mounted) setPreviewError('Falha ao carregar preview.');
      } finally {
        if (mounted) setLoadingPreview(false);
      }
    }

    fetchPreview();
    return () => { mounted = false; };
  }, [urlVideo]);

  async function handleConcluir() {
    setError(null);
    setLoading(true);
    try {
      if (!titulo || titulo.trim().length === 0) throw new Error('Título é obrigatório');

      if (materialType === 'video') {
        if (!urlVideo || urlVideo.trim().length === 0) throw new Error('A URL do vídeo é obrigatória');
        if (initialMaterial && initialMaterial.type === 'video' && initialMaterial.id) {
          // update existing video
          await updateVideo(initialMaterial.id, { nomeVideo: titulo, descricaoVideo: descricao || null, urlVideo, ordemVideo: 1 });
        } else {
          await createVideoCommand({ nomeVideo: titulo, descricaoVideo: descricao || null, urlVideo, ordemVideo: 1, fkCurso: cursoId });
        }
      } else {
        // apostila - usar novo endpoint multipart que envia direto para S3
        if (initialMaterial && initialMaterial.type === 'pdf' && initialMaterial.id) {
          // update existing apostila
          await updateApostila(initialMaterial.id, { nomeApostila: titulo, descricaoApostila: descricao || null, tamanhoBytes: file ? file.size : (initialMaterial.tamanhoBytes || 0) });
          if (file) {
            // Se tem novo arquivo, usa o novo endpoint para fazer upload e atualizar URL
            const arquivoUrl = await uploadFileToS3(file, 'bronze');
            await updateApostilaUrl(initialMaterial.id, arquivoUrl);
          }
        } else {
          // Criar nova apostila com upload S3 integrado
          await uploadApostilaToS3({
            file: file,
            fkCurso: cursoId,
            nomeApostila: titulo,
            descricaoApostila: descricao || null
          });
        }
      }

      // sucesso
      setIsEditing(false);
      setTitulo(''); setDescricao(''); setFile(null); setUrlVideo('');
      if (onAdded) onAdded();
      if (initialMaterial && onCancelEdit) onCancelEdit();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // when parent provides initialMaterial, open editor and prefill fields
  React.useEffect(() => {
    if (initialMaterial) {
      setIsEditing(true);
      setTitulo(initialMaterial.title || initialMaterial.nomeApostila || initialMaterial.nomeVideo || '');
      setDescricao(initialMaterial.description || initialMaterial.descricaoApostila || initialMaterial.descricaoVideo || '');
      if (initialMaterial.type === 'video') {
        setMaterialType('video');
        setUrlVideo(initialMaterial.url || initialMaterial.urlVideo || '');
      } else {
        setMaterialType('pdf');
        setFile(null);
      }
    }
  }, [initialMaterial]);

  return (
    <div>
      {!isEditing ? (
        <div className="bg-slate-100 border border-slate-300 rounded-lg shadow-md p-4 flex justify-center items-center mb-8">
          <Button 
            variant="Default" 
            label="Adicionar Material" 
            onClick={() => {
              // open fresh editor for creating a new material
              setTitulo(''); setDescricao(''); setFile(null); setUrlVideo(''); setMaterialType('pdf');
              setIsEditing(true);
            }} 
          />
        </div>
      ) : (
        <div className="bg-[#1D262D] rounded-lg p-4 sm:p-6 mb-8">
          {/* Título no topo */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Adicionar Título"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          {/* Botões apenas no desktop */}
          <div className="hidden sm:flex items-center gap-4 mb-4">
            <Button 
              variant={initialMaterial ? 'Primary' : 'Confirm'}
              label={loading ? 'Salvando...' : (initialMaterial ? 'Atualizar' : 'Concluir')}
              onClick={handleConcluir}
            />
            <Button variant="Exit" label="Cancelar" onClick={() => {
              setIsEditing(false);
              if (initialMaterial && onCancelEdit) onCancelEdit();
            }} />
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6">
            {/* Seletor de formato - Mobile: horizontal no topo / Desktop: lateral */}
            <div className="mb-4 sm:hidden">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">Formato:</span>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded border ${materialType === 'pdf' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                  onClick={() => setMaterialType('pdf')}
                >
                  PDF
                </button>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded border ${materialType === 'video' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                  onClick={() => setMaterialType('video')}
                >
                  Vídeo
                </button>
              </div>
            </div>

            {materialType === 'pdf' ? (
              <div className="border border-dashed border-gray-400 rounded-lg p-4 mb-4 flex flex-col md:flex-row items-center gap-4">
                {/* prominent PDF area: when no file selected show a big select button; when file selected show filename with X */}
                {!file ? (
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-red-50 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v4m0 0l-3-3m3 3l3-3M7 7h10M7 7v10a2 2 0 002 2h6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-semibold">Arquivo PDF</p>
                      <p className="text-sm text-gray-500">Selecione um arquivo PDF para adicionar ao curso</p>
                      <label className="inline-flex items-center mt-3 cursor-pointer">
                        <span className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Selecione o arquivo</span>
                        <input type="file" accept="application/pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v4m0 0l-3-3m3 3l3-3M7 7h10M7 7v10a2 2 0 002 2h6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Arquivo anexado:</p>
                        <p className="font-medium">{file.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-red-600 font-semibold px-2 py-1 rounded hover:bg-red-50" onClick={() => setFile(null)} aria-label="Remover arquivo">✕</button>
                    </div>
                  </div>
                )}

                {/* if editing an existing apostila and no new file selected, show current file name from URL */}
                {!file && initialMaterial && (initialMaterial.url || initialMaterial.urlApostila || initialMaterial.urlArquivo) && (
                  <div className="w-full mt-3 px-4">
                    <span className="text-sm text-gray-700">Arquivo atual: <strong>{(initialMaterial.url || initialMaterial.urlApostila || initialMaterial.urlArquivo).split('/').pop()}</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cole a URL do vídeo aqui..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
                    value={urlVideo}
                    onChange={e => setUrlVideo(e.target.value)}
                  />
                  {urlVideo && (
                    <button
                      type="button"
                      className="px-3 py-2 bg-red-50 text-red-600 rounded text-sm border border-red-100"
                      onClick={() => setUrlVideo('')}
                    >
                      Remover
                    </button>
                  )}
                </div>

                {urlVideo && (
                  <div className="mt-3">
                    {loadingPreview ? (
                      <div className="text-sm text-gray-500">Carregando preview...</div>
                    ) : previewError ? (
                      <div className="text-sm text-yellow-700">{previewError}</div>
                    ) : videoPreview ? (
                      <div className="flex items-start gap-4">
                        <img src={videoPreview.thumbnail_url || videoPreview.thumbnail} alt={videoPreview.title} className="w-48 h-28 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{videoPreview.title}</p>
                          {videoPreview.author_name && <p className="text-sm text-gray-500">{videoPreview.author_name}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Preview não disponível para esta URL.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Seletor de formato - Desktop: lateral */}
              <div className="hidden sm:flex flex-col gap-2 flex-shrink-0 w-32">
                <span className="font-semibold text-sm">Formato:</span>
                <button 
                  className={`w-full px-3 py-2 text-sm font-medium rounded border ${materialType === 'pdf' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                  onClick={() => setMaterialType('pdf')}
                >
                  PDF
                </button>
                <button 
                  className={`w-full px-3 py-2 text-sm font-medium rounded border ${materialType === 'video' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                  onClick={() => setMaterialType('video')}
                >
                  Vídeo
                </button>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Sobre o {materialType === 'video' ? 'vídeo' : 'arquivo'}:</label>
                <textarea
                  placeholder="Adicionar Descrição..."
                  className="w-full h-20 p-2 border border-gray-300 rounded-lg resize-none"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="text-red-600 mt-2">{String(error)}</div>}
          </div>

          {/* Botões no mobile - abaixo de tudo */}
          <div className="flex sm:hidden flex-col gap-3 mt-4">
            <Button 
              variant={initialMaterial ? 'Primary' : 'Confirm'}
              label={loading ? 'Salvando...' : (initialMaterial ? 'Atualizar' : 'Concluir')}
              onClick={handleConcluir}
              className="w-full"
            />
            <Button variant="Exit" label="Cancelar" onClick={() => {
              setIsEditing(false);
              if (initialMaterial && onCancelEdit) onCancelEdit();
            }} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
