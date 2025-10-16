

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamBuilder from "../components/ExamBuilder.jsx";
import CreateExamPageService from "../services/CreateExamPageService.js";

export default function CreateExamPage() {
  const { idCurso } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  const handleExamCreated = (newExam) => {
    console.log('Avaliação criada:', newExam);
    loadExams(); // Recarrega lista
    
    // Opcional: navegar de volta para lista de materiais
    // navigate(`/cursos/${cursoId}/material`);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => window.location.href = `/cursos/${cursoId}/material/`}
            className="mb-4 px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
          >
            ← Voltar
          </button>
          <TituloPrincipal>Criar Avaliação - Curso {cursoId}</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <ExamBuilder 
            cursoId={cursoId} 
            onExamCreated={handleExamCreated}
          />
        </div>

        {/* Lista de avaliações existentes (opcional) */}
        {/* Listagem de avaliações removida conforme solicitado */}
      </div>
    </div>
  );
}
