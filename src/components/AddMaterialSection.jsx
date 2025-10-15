import React, { useState } from 'react';
import Button from './Button';
import { uploadFileToS3, createVideoCommand, createApostilaCommand, updateApostilaUrl, updateApostila, updateVideo } from '../services/UploadService.js';
import { useParams } from 'react-router-dom';

export default function AddMaterialSection({ cursoId: propCursoId = null, onAdded = null, initialMaterial = null, onCancelEdit = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [materialType, setMaterialType] = useState('pdf'); // 'pdf' or 'video'

  // form fields
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [file, setFile] = useState(null);
  const [urlVideo, setUrlVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const params = useParams();
  const idCursoFromParams = params.idCurso ?? params.id ?? null;
  const cursoId = propCursoId || idCursoFromParams || 1;

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
        // apostila
        let arquivoUrl = null;
        if (file) {
          arquivoUrl = await uploadFileToS3(file, 'bronze');
        }
        if (initialMaterial && initialMaterial.type === 'pdf' && initialMaterial.id) {
          // update existing apostila
          await updateApostila(initialMaterial.id, { nomeApostila: titulo, descricaoApostila: descricao || null, tamanhoBytes: file ? file.size : (initialMaterial.tamanhoBytes || 0) });
          if (arquivoUrl) {
            await updateApostilaUrl(initialMaterial.id, arquivoUrl);
          }
        } else {
          const created = await createApostilaCommand({
            nomeApostilaOriginal: titulo,
            nomeApostilaArmazenamento: file ? file.name : titulo,
            descricaoApostila: descricao || null,
            tamanhoBytes: file ? file.size : 0,
            isApostilaOculto: 0,
            ordemApostila: 1,
            fkCurso: cursoId,
            urlApostila: arquivoUrl
          });

          // tentar atualizar a url da apostila via endpoint específico, se tivermos id
          try {
            const id = created && (created.id || created.idApostila || created.id_apostila || null);
            if (arquivoUrl && id) {
              await updateApostilaUrl(id, arquivoUrl);
            }
          } catch (err) {
            console.warn('Falha ao atualizar URL da apostila via PATCH:', err);
          }
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-center items-center mb-8">
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
        <div className="bg-[#1D262D] rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Adicionar Título"
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
            <Button variant="Confirm" label={loading ? 'Salvando...' : 'Concluir'} onClick={handleConcluir} />
            <Button variant="Exit" label="Cancelar" onClick={() => {
              setIsEditing(false);
              if (initialMaterial && onCancelEdit) onCancelEdit();
            }} />
          </div>

          <div className="bg-white rounded-lg p-6">
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
                <input
                  type="text"
                  placeholder="Cole a URL do vídeo aqui..."
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
                  value={urlVideo}
                  onChange={e => setUrlVideo(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-6">
              <div className="flex-shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Arquivo</span>
                  <button 
                    className={`px-3 py-1 text-xs rounded border ${materialType === 'pdf' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                    onClick={() => setMaterialType('pdf')}
                  >
                    PDF
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Vídeo</span>
                  <button 
                      className={`px-3 py-1 text-xs rounded border ${materialType === 'video' ? 'bg-gray-300 border-gray-500' : 'bg-white border-gray-400'}`}
                      onClick={() => setMaterialType('video')}
                    >
                      URL
                    </button>
                </div>
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
        </div>
      )}
    </div>
  );
}
