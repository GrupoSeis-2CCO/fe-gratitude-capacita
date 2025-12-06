

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamBuilder from "../components/ExamBuilder.jsx";
import CreateExamPageService from "../services/CreateExamPageService.js";
import { api } from "../services/api.js";

export default function CreateExamPage() {
  const { idCurso } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoNome, setCursoNome] = useState("");
  const cursoId = idCurso ? Number(idCurso) : 1;

  const loadExams = () => {
    setLoading(true);
    CreateExamPageService.getExams()
      .then(setExams)
      .catch((err) => {
        console.error('Erro ao carregar avaliações:', err);
        setExams([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExams();
    api.get(`/cursos/${cursoId}/detalhes`)
      .then((resp) => {
        const curso = resp.data;
        setCursoNome(curso?.tituloCurso || curso?.nome || curso?.titulo || `Curso ${cursoId}`);
      })
      .catch(() => {
        setCursoNome(`Curso ${cursoId}`);
      });
  }, [cursoId]);

  const handleExamCreated = (newExam) => {
    console.log('Avaliação criada:', newExam);
    loadExams();
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-13 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
          </div>
          <TituloPrincipal>Criar Avaliação - {cursoNome}</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <ExamBuilder 
              cursoId={cursoId} 
              onExamCreated={handleExamCreated}
              onSaveExam={async (examData) => {
                try {
                  console.log('[CreateExamPage] Payload enviado:', JSON.stringify(examData, null, 2));
                  const created = await CreateExamPageService.createExam(examData);
                  console.log('[CreateExamPage] Resposta criação:', created);
                  handleExamCreated(created);
                  return created;
                } catch (e) {
                  console.error('[CreateExamPage] Erro ao criar avaliação:', e);
                  throw e;
                }
              }}
            />
        </div>
      </div>
    </div>
  );
}

