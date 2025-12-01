import React, { useEffect, useMemo, useRef, useState } from 'react';

import Button from './Button';

import { createCourse, updateCourse, toggleCourseHidden } from '../services/ClassListPageService.js';

import PromptModal from './PromptModal.jsx';

import SmartImage from './SmartImage.jsx';



export default function AddCourseSection({ onCourseCreated, editCourse }) {

  const TITLE_MAX = 100;

  const DESC_MAX = 255;

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

  const [hours, setHours] = useState(""); // duracaoEstimada em horas (inteiro)

  const isUpdate = useMemo(() => Boolean(idCurso), [idCurso]);
  const originalHiddenRef = useRef(null);



  useEffect(() => {

    // If editCourse prop is provided, enter edit mode and prefill

    if (editCourse) {

      setIsEditing(true);

      setIdCurso(editCourse.id ?? editCourse.idCurso ?? null);

      setTitle(editCourse.title ?? editCourse.tituloCurso ?? '');

      setContent(editCourse.description ?? editCourse.descricao ?? '');

      setImage(editCourse.imageUrl ?? editCourse.imagem ?? null);

      const initialHidden = Boolean(editCourse.ocultado);
      setIsHidden(initialHidden);
      originalHiddenRef.current = initialHidden;

      // tenta preencher horas a partir do campo duracaoEstimada ou de strings como "20h"


      const parseHours = (val) => {
        if (val == null) return "";
        if (typeof val === 'number' && Number.isFinite(val)) return String(val);
        // extract all digit groups and join them to form a consistent integer string
        const groups = String(val).match(/\d+/g);
        return groups ? groups.join('') : "";
      };

      setHours(parseHours(editCourse.duracaoEstimada ?? editCourse.stats?.hours));

    }

  }, [editCourse]);



  if (!isEditing) {

    return (

      <div className="bg-slate-100 border border-slate-300 rounded-lg shadow-md p-4 flex justify-center items-center mb-8">

        <Button variant="Confirm" label="Adicionar Curso" onClick={() => { setIsHidden(true); setIsEditing(true); }} />

      </div>

    );

  }



  return (

    <div className="bg-[#1D262D] rounded-lg p-6 mb-8">

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">

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

              // Monta payload base
              const payload = { tituloCurso: title.trim(), ocultado: isHidden };
              if (content && content.trim()) payload.descricao = content.trim();

              // valida e aplica duracaoEstimada (horas inteiras)
              if (hours !== "") {
                const hoursTrim = String(hours).trim();
                if (!/^[0-9]+$/.test(hoursTrim)) {
                  setError('Total de horas inválido: informe um número inteiro não-negativo.');
                  setLoading(false);
                  return;
                }
                payload.duracaoEstimada = parseInt(hoursTrim, 10);
              }

              // Se tem arquivo de imagem, envia via multipart (backend faz upload para S3)
              if (file) {
                payload.file = file; // createCourse detecta e envia como multipart
              } else if (image && !image.startsWith('blob:')) {
                // Se é URL externa (não blob), passa direto
                if (image.length > IMAGE_MAX_BACKEND) {
                  setError(`URL da imagem muito longa (máx. ${IMAGE_MAX_BACKEND} caracteres).`);
                  setLoading(false);
                  return;
                }
                payload.imagem = image;
              }

              if (isUpdate && idCurso) {
                // Para update, se tem arquivo novo, passa o file para updateCourse (multipart)
                if (file) {
                  payload.file = file;
                }
                await updateCourse(idCurso, payload);
                // Se mudou o estado de oculto na edição, chama o endpoint específico para alternar
                try {
                  if (originalHiddenRef.current !== isHidden) {
                    await toggleCourseHidden(idCurso);
                  }
                } catch (errToggle) {
                  console.error('Erro ao aplicar ocultação do curso:', errToggle);
                }
              } else {
                // Criação: usa multipart se tem arquivo
                await createCourse(payload);
              }

              setIsEditing(false);

              setIdCurso(null);

              setTitle('');

              setContent('');

              setImage(null);

              setFile(null);

              setHours("");

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

        <Button variant="Exit" label="Sair" onClick={() => { setIsEditing(false); setTitle(''); setContent(''); }} />

      </div>



      <div className="bg-white rounded-lg p-6 flex flex-col lg:flex-row items-start gap-6">

        <div className="w-full lg:w-1/3">

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
              className="ml-2 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer"
              onClick={() => setUrlModalOpen(true)}
            >Usar URL</button>

          </div>

        </div>



        <div className="w-full lg:w-1/3">

          <label className="block text-lg font-semibold mb-2">Descrição</label>

          <textarea

            placeholder="Adicionar descrição..."

            value={content}

            onChange={(e) => setContent(e.target.value)}

            maxLength={DESC_MAX}

            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"

          />

        </div>



        <div className="flex-1">

          <div className="space-y-4">

            <label className="block text-lg font-semibold">Total de Horas (inteiro)</label>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ex.: 20"
              value={hours}
              onChange={(e) => {
                const v = e.target.value || '';
                // Remove any non-digit characters so only integers remain
                const digitsOnly = String(v).replace(/\D/g, '');
                // If user attempted to type non-digits, show brief validation message
                if (v && /\D/.test(v)) {
                  setError('Informe apenas números inteiros para Total de Horas.');
                } else {
                  setError(null);
                }
                setHours(digitsOnly);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />

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

          // Accept any non-empty URL/value but keep backend length safeguard

          if (!v) { setError('Informe uma URL'); return; }

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
