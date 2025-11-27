import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamViewer from "../components/ExamViewer.jsx";

export default function StudentAnswerSheetPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const { idCurso, tentativa } = useParams();
  const navigate = useNavigate();

  if (!isLoggedIn() || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const mockAnswerSheet = {
    examTitle: "Avaliacao de Regularizacao Fundiaria",
    studentName: "Nome do Colaborador",
    attemptDate: "15/09/2025 14:30",
    score: 7,
    maxScore: 10,
    duration: "45 minutos"
  };

  const mockQuestions = [
    {
      id: 1,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
      alternatives: [
        { id: 1, text: "Alternativa 1" },
        { id: 2, text: "Alternativa 2" },
        { id: 3, text: "Alternativa 3" },
        { id: 4, text: "Alternativa 4" }
      ]
    },
    {
      id: 2,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
      alternatives: [
        { id: 1, text: "Alternativa 1" },
        { id: 2, text: "Alternativa 2" },
        { id: 3, text: "Alternativa 3" },
        { id: 4, text: "Alternativa 4" }
      ]
    },
    {
      id: 3,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
      alternatives: [
        { id: 1, text: "Alternativa 1" },
        { id: 2, text: "Alternativa 2" },
        { id: 3, text: "Alternativa 3" },
        { id: 4, text: "Alternativa 4" }
      ]
    }
  ];

  const mockUserAnswers = {
    1: 2,
    2: 3,
    3: 1
  };

  const mockCorrectAnswers = {
    1: 3,
    2: 3,
    3: 2
  };

  const handleBackToExams = () => {
    navigate(`/avaliacoes`);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-4 sm:px-6 lg:px-8 pt-13 md:pt-13 pb-16">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="max-w-4xl mx-auto">
          <TituloPrincipal>Gabarito - {mockAnswerSheet.examTitle}</TituloPrincipal>
        </div>

        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Informacoes da Tentativa</h2>
                <p className="text-sm text-gray-600">Aluno: {mockAnswerSheet.studentName}</p>
              </div>
              <button
                className="self-start px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded cursor-pointer"
                onClick={handleBackToExams}
              >
                Voltar para avaliacoes
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base">
              <div className="space-y-1">
                <p><strong>Data:</strong> {mockAnswerSheet.attemptDate}</p>
                <p><strong>Duracao:</strong> {mockAnswerSheet.duration}</p>
              </div>
              <div className="space-y-1">
                <p><strong>Nota:</strong> {mockAnswerSheet.score}/{mockAnswerSheet.maxScore}</p>
                <p><strong>Aproveitamento:</strong> {((mockAnswerSheet.score / mockAnswerSheet.maxScore) * 100).toFixed(1)}%</p>
              </div>
              <div className="flex md:justify-end items-center">
                {/* BackButton removido - gerenciado pelo Header */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 max-w-4xl mx-auto w-full">
          <ExamViewer
            questions={mockQuestions}
            userAnswers={mockUserAnswers}
            correctAnswers={mockCorrectAnswers}
          />
        </div>
      </div>
    </div>
  );
}

