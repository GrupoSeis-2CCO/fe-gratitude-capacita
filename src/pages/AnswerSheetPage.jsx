import React, { useEffect, useState } from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import ExamViewer from "../components/ExamViewer.jsx";
import AnswerSheetPageService from "../services/AnswerSheetPageService.js";

export default function AnswerSheetPage({ userId, examId }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
  // Ajuste userId/examId conforme sua lógica de autenticação/rotas
  // Fallback para o cenário de teste: userId=20 (John Doe), examId=1
  const data = await AnswerSheetPageService.getAnswerSheetData(userId || 20, examId || 1);
        setQuestions(data.questions || []);
        setUserAnswers(data.userAnswers || {});
        setCorrectAnswers(data.correctAnswers || {});
      } catch (err) {
        setError("Erro ao carregar gabarito");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, examId]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />
      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Gabarito - Avaliação</TituloPrincipal>
        </div>
        <div className="mt-8 w-full">
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ExamViewer 
              questions={questions} 
              userAnswers={userAnswers} 
              correctAnswers={correctAnswers} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
