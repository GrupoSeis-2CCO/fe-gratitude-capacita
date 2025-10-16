import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamBuilder from "../components/ExamBuilder.jsx";
import ExamPageService from "../services/ExamPageService.js";

export default function EditExamPage() {
  const { idCurso } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExam() {
      setLoading(true);
      setError(null);
      try {
        // Converter idCurso para número para garantir compatibilidade
        const cursoIdNum = Number(idCurso);
        const data = await ExamPageService.getExamByCourseId(cursoIdNum);
  console.log('[EditExamPage] Dados recebidos do backend:', data);
  setExamData(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setError("Nenhuma avaliação encontrada para este curso.");
        } else {
          setError("Erro ao carregar avaliação");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [idCurso]);

  const [success, setSuccess] = useState(false);
  const handleSave = async (updatedExam) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const cursoIdNum = Number(idCurso);
      await ExamPageService.updateExam(cursoIdNum, updatedExam);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/cursos/${idCurso}/material/avaliacao`);
      }, 1200); // Redireciona após 1.2s
    } catch (err) {
      setError("Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />
      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Editar Avaliação - Curso {idCurso}</TituloPrincipal>
        </div>
        <div className="mt-8 w-full flex flex-col items-center justify-center">
          <div className="w-full flex justify-start mb-4">
            <Button
              variant="Ghost"
              label="← Voltar para Material"
              onClick={() => navigate(`/cursos/${idCurso}/material`)}
            />
          </div>
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <ExamBuilder
                cursoId={idCurso}
                initialData={examData ? {
                  ...examData,
                  notaMinima: examData.notaMinima ?? examData.acertosMinimos ?? '',
                  questoes: examData.questoes ?? []
                } : null}
                onExamCreated={handleSave}
                onExamSaved={handleSave}
                editMode={true}
              />
              {success && (
                <div className="mt-6 px-6 py-4 bg-blue-100 border-l-4 border-blue-500 text-blue-900 rounded shadow font-semibold animate-fade-in">
                  Avaliação atualizada com sucesso!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
