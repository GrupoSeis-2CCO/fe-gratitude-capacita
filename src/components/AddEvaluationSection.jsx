import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './Button';
import ConfirmModal from './ConfirmModal.jsx';
import ExamPageService from '../services/ExamPageService.js';

export default function AddEvaluationSection({ onDeleted = null }) {
  const navigate = useNavigate();
  const params = useParams();
  const idCurso = params.idCurso ?? params.id ?? null;
  const [checking, setChecking] = useState(false);
  const [hasExam, setHasExam] = useState(false);
  const [examId, setExamId] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [respostasCount, setRespostasCount] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forceConfirmOpen, setForceConfirmOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkExam() {
      if (!idCurso) return;
      setChecking(true);
      setError(null);
      try {
        const data = await ExamPageService.getExamByCourseId(Number(idCurso));
        if (!mounted) return;
        if (data && data.idAvaliacao) {
          setHasExam(true);
          setExamId(Number(data.idAvaliacao));
        } else {
          setHasExam(false);
          setExamId(null);
        }
      } catch (e) {
        // Se 404, significa que não há avaliação criada — não é erro para desabilitar criação
        const status = e?.response?.status;
        if (status === 404) {
          setHasExam(false);
          setExamId(null);
        } else {
          setError(e?.message || 'Falha ao verificar avaliação');
        }
      } finally {
        if (mounted) setChecking(false);
      }
    }
    checkExam();
    return () => { mounted = false; };
  }, [idCurso]);

  const handleCreate = () => {
    if (!idCurso) return navigate('/cursos');
    navigate(`/cursos/${idCurso}/material/adicionar-avaliacao`);
  };

  const handleEdit = () => {
    if (!idCurso) return;
    navigate(`/cursos/${idCurso}/material/avaliacao/editar`);
  };

  const handleDelete = async () => {
    if (!idCurso || !hasExam || !examId) return;
    setDeleteError(null);
    try {
      const resp = await ExamPageService.hasResponsesForExamId(examId);
      const hasResponses = resp && resp.hasResponses === true;
      const count = resp && typeof resp.respostasCount !== 'undefined' ? resp.respostasCount : null;
      if (hasResponses) {
        setRespostasCount(count);
        setForceConfirmOpen(true);
        return;
      }
      setConfirmOpen(true);
    } catch (err) {
      // se falhar na checagem, pedir confirmação padrão
      setConfirmOpen(true);
    }
  };

  const performDelete = async (force = false) => {
    if (!idCurso || !hasExam || !examId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await ExamPageService.deleteExamByCourseId(Number(idCurso), force === true);
      document.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Avaliação excluída com sucesso.' } }));
      setHasExam(false);
      setExamId(null);
      if (typeof onDeleted === 'function') {
        try { await onDeleted(); } catch (_) { /* noop */ }
      }
      // on success, close any open modals
      setConfirmOpen(false);
      setForceConfirmOpen(false);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        // Backend returned conflict; if it included respostasCount, surface the force modal so the user can choose
        const data = e?.response?.data;
        const count = data && (data.respostasCount || data.respostasCount === 0) ? data.respostasCount : null;
        if (count !== null) {
          // open force confirm so user can opt to delete everything
          setRespostasCount(count);
          setForceConfirmOpen(true);
          document.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: `Existem ${count} respostas registradas. Confirme se deseja excluir tudo.` } }));
        } else {
          setDeleteError('Não é possível excluir: já existem respostas registradas.');
          document.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Exclusão bloqueada: existem respostas.' } }));
        }
      } else if (status === 404) {
        setDeleteError('Avaliação não encontrada.');
        document.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Avaliação não encontrada.' } }));
      } else {
        setDeleteError('Erro ao excluir avaliação.');
        document.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Erro desconhecido ao excluir.' } }));
      }
    } finally {
      setIsDeleting(false);
      // do not forcibly close modals here — allow catch/confirm flow to control them
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mt-8">
      <Button
        variant="Default"
        label={checking ? 'Verificando...' : 'Adicionar Avaliação'}
        onClick={handleCreate}
        disabled={checking || hasExam}
        title={hasExam ? 'Já existe uma avaliação para este curso' : 'Criar nova avaliação'}
        className="w-full sm:w-auto"
      />
      {hasExam && (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
          <Button
            variant="Confirm"
            label="Editar Avaliação"
            onClick={handleEdit}
            title="Editar avaliação existente"
            className="w-full sm:w-auto"
          />
          <Button
            variant="Exit"
            label={isDeleting ? 'Excluindo...' : 'Excluir Avaliação'}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Excluir avaliação (se não houver respostas)"
            className="w-full sm:w-auto"
          />
        </div>
      )}
      {(error || deleteError) && (
        <div className="text-xs text-red-600 mt-2 sm:mt-0">{error || deleteError}</div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar exclusão"
        message="Deseja realmente excluir esta avaliação? Esta ação não pode ser desfeita."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => performDelete(false)}
        confirmDisabled={isDeleting}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
      />

      <ConfirmModal
        open={forceConfirmOpen}
        title="Avaliação com respostas"
        message={<>
          <div className="mb-2">Esta avaliação já possui respostas registradas. Excluir irá remover também todas as respostas associadas — isto é irreversível.</div>
          {respostasCount !== null ? (
            <div className="mb-2">Existem <span className="font-semibold">{respostasCount}</span> respostas registradas.</div>
          ) : null}
          <div className="font-semibold">Tem certeza que deseja prosseguir e excluir tudo?</div>
        </>}
        onCancel={() => setForceConfirmOpen(false)}
        onConfirm={() => performDelete(true)}
        confirmDisabled={isDeleting}
        confirmLabel="Sim, excluir tudo"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
