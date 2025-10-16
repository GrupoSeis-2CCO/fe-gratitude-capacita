import React, { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import { createCourse, updateCourse } from '../services/ClassListPageService.js';
import { uploadFileToS3 } from '../services/UploadService.js';
import PromptModal from './PromptModal.jsx';
import { api } from '../services/api.js';
import SmartImage from './SmartImage.jsx';

export default function AddCourseSection({ onCourseCreated, editCourse }) {
  const TITLE_MAX = 50;
  const DESC_MAX = 100;
  const IMAGE_MAX = 255;
  // Backend column now supports up to 1024 chars
  const IMAGE_MAX_BACKEND = 1024;
  const [isEditing, setIsEditing] = useState(false);
  const [idCurso, setIdCurso] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [image, setImage] = useState(null); // URL string
  const [file, setFile] = useState(null); // File object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const isUpdate = useMemo(() => Boolean(idCurso), [idCurso]);

  useEffect(() => {
    // If editCourse prop is provided, enter edit mode and prefill
    if (editCourse) {
      setIsEditing(true);
      setIdCurso(editCourse.id ?? editCourse.idCurso ?? null);
      setTitle(editCourse.title ?? editCourse.tituloCurso ?? '');
      setContent(editCourse.description ?? editCourse.descricao ?? '');
      setImage(editCourse.imageUrl ?? editCourse.imagem ?? null);
      setIsHidden(Boolean(editCourse.ocultado));
    }
  }, [editCourse]);

  if (!isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center mb-8">
        <select className="border border-gray-300 rounded-md p-2 text-sm">
          <option>Ordenar por</option>
          <option>Mais Recentes</option>
          <option>Mais Antigos</option>
          <option>Ordem Alfabética</option>
        </select>
        <Button variant="Confirm" label="Adicionar Curso" onClick={() => { setIsHidden(true); setIsEditing(true); }} />
      </div>
    );
  }

  return (
    <div className="bg-[#1D262D] rounded-lg p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Adicionar nome"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 text-lg"
        />
        {/* Hidden toggle - use shared Button for consistent sizing */}
        <Button
          variant={isHidden ? 'Ghost' : 'Default'}
          label={isHidden ? '🔒 Oculto' : '🔓 Visível'}
          onClick={() => setIsHidden(!isHidden)}
        />

        <Button
          variant="Confirm"
          label={isUpdate ? 'Atualizar' : 'Concluir'}
          onClick={async () => {
            setError(null);
            if (!title?.trim()) { setError('Informe o título do curso'); return; }
            if (title.trim().length > TITLE_MAX) { setError(`Título muito longo (máx. ${TITLE_MAX} caracteres)`); return; }
            if (content && content.length > DESC_MAX) { setError(`Descrição muito longa (máx. ${DESC_MAX} caracteres)`); return; }
            setLoading(true);
            try {
              let finalImageUrl = image || null;
              if (file) {
                const uploadedUrl = await uploadFileToS3(file, 'bronze');
                finalImageUrl = uploadedUrl;
              }
              // Validate image URL (only http/https and <= 255)
              if (finalImageUrl) {
                const isBlob = finalImageUrl.startsWith('blob:');
                const isData = finalImageUrl.startsWith('data:');
                const isUploadsPath = finalImageUrl.startsWith('/uploads');
                const isHttp = /^https?:\/\//i.test(finalImageUrl);
                if (isBlob || isData) {
                  setError('Imagem inválida: use o upload de arquivo ou uma URL http(s) pública.');
                  setLoading(false);
                  return;
                }
                // Allow http(s) public URLs or our own backend-served uploads path
                if (!(isHttp || isUploadsPath)) {
                  setError('Informe uma URL pública válida (http/https) ou use o upload de arquivo.');
                  setLoading(false);
                  return;
                }
                if (finalImageUrl.length > IMAGE_MAX_BACKEND) {
                  setError(`URL da imagem muito longa (máx. ${IMAGE_MAX_BACKEND} caracteres).`);
                  setLoading(false);
                  return;
                }
              }

              const payload = { tituloCurso: title.trim() };
              if (content && content.trim()) payload.descricao = content.trim();
              if (finalImageUrl) payload.imagem = finalImageUrl;

              if (isUpdate && idCurso) {
                await updateCourse(idCurso, payload);
              } else {
                await createCourse(payload);
              }
              setIsEditing(false);
              setIdCurso(null);
              setTitle('');
              setContent('');
              setImage(null);
              setFile(null);
              setError(null);
              if (onCourseCreated) await onCourseCreated();
            } catch (e) {
              console.error(e);
              setError(e?.response?.data || e?.message || 'Falha ao salvar curso');
            } finally {
              setLoading(false);
            }
          }}
        />
        <Button variant="Exit" label="Excluir" onClick={() => { setIsEditing(false); setTitle(''); setContent(''); }} />
      </div>

      <div className="bg-white rounded-lg p-6 flex items-start gap-6">
        <div className="w-1/3">
          <div className="rounded-lg border border-gray-200 h-40 flex items-center justify-center bg-gray-50 overflow-hidden">
            <SmartImage
              src={image || '/default-course-icon.svg'}
              alt="Imagem do curso"
              className="w-24 h-24 object-cover rounded-full bg-gray-200"
            />
          </div>
          <div className="mt-2 flex justify-center">
            <label className="px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer">
              Adicionar imagem
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    const previewUrl = URL.createObjectURL(f);
                    setImage(previewUrl);
                  }
                }}
              />
            </label>
            <button
              className="ml-2 px-3 py-2 border border-gray-300 rounded text-sm"
              onClick={() => setUrlModalOpen(true)}
            >Usar URL</button>
          </div>
        </div>

        <div className="w-1/3">
          <label className="block text-lg font-semibold mb-2">Conteúdo</label>
          <textarea
            placeholder="Adicionar Conteúdo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={DESC_MAX}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        <div className="flex-1">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium">Quantidade de Materiais</div>
            <div className="text-lg font-medium">Quantidade de Alunos</div>
            <div className="text-lg font-medium">Total de Horas</div>
            {loading && <div className="text-sm text-gray-300">Salvando...</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
          </div>
        </div>
      </div>
      <PromptModal
        open={urlModalOpen}
        title="Usar URL da imagem"
        label="URL pública"
        placeholder="https://..."
        initialValue={image || ''}
        confirmLabel="Aplicar"
        cancelLabel="Cancelar"
        onConfirm={(value) => {
          const v = (value || '').trim();
          // Validate before accepting
          if (!v) { setError('Informe uma URL pública'); return; }
          if (!/^https?:\/\//i.test(v)) { setError('Informe uma URL válida iniciando com http(s)'); return; }
          if (v.length > IMAGE_MAX_BACKEND) { setError(`URL muito longa (máx. ${IMAGE_MAX_BACKEND} caracteres)`); return; }
          setImage(v);
          setFile(null);
          setError(null);
          setUrlModalOpen(false);
        }}
        onCancel={() => setUrlModalOpen(false)}
      />
    </div>
  );
}
