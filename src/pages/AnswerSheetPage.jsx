import React, { useEffect, useState } from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import ExamViewer from "../components/ExamViewer.jsx";
import AnswerSheetPageService from "../services/AnswerSheetPageService.js";
import BackButton from "../components/BackButton.jsx";
import { useParams } from "react-router-dom";
import { api } from "../services/api.js";

// Página de gabarito para visão administrativa (participante/:idUsuario/avaliacoes/:idTentativa)
// Resolve examId (fkAvaliacao) dinamicamente a partir da tentativa informada em :idTentativa
// Remove fallbacks hardcoded (20/1) para garantir integração real com backend
export default function AnswerSheetPage() {
  const { idUsuario, idTentativa } = useParams();
  const idUsuarioNum = idUsuario ? Number(idUsuario) : null;
  const idTentativaNum = idTentativa ? Number(idTentativa) : null;

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examIdResolved, setExamIdResolved] = useState(null);
  const [attemptLookupDone, setAttemptLookupDone] = useState(false);

  // Primeiro passo: localizar fkAvaliacao a partir da lista de tentativas do usuário
  useEffect(() => {
    async function resolveExamId() {
      if (!idUsuarioNum || !idTentativaNum) {
        setError("Parâmetros ausentes na rota (idUsuario/idTentativa)");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get(`/tentativas/usuario/${idUsuarioNum}`);
        const tentativas = Array.isArray(resp.data) ? resp.data : [];
        const alvo = tentativas.find(t => {
          const tid = t.idTentativa ?? t.id ?? t.idTentativaComposto?.idTentativa;
          return Number(tid) === idTentativaNum;
        });
        if (!alvo) {
          setError("Tentativa não encontrada para este usuário");
        } else {
          const fkAvaliacao = alvo.fkAvaliacao || alvo?.avaliacao?.idAvaliacao || null;
          if (!fkAvaliacao) {
            setError("fkAvaliacao não disponível na tentativa selecionada");
          } else {
            setExamIdResolved(Number(fkAvaliacao));
          }
        }
      } catch (e) {
        console.error("Falha ao resolver examId da tentativa", e);
        setError("Erro ao localizar tentativa");
      } finally {
        setAttemptLookupDone(true);
        setLoading(false);
      }
    }
    resolveExamId();
  }, [idUsuarioNum, idTentativaNum]);

  // Segundo passo: carregar gabarito quando examIdResolved estiver definido
  useEffect(() => {
    async function loadAnswerSheet() {
      if (!attemptLookupDone) return; // aguardando resolução
      if (!examIdResolved || !idUsuarioNum) return; // examId não resolvido ainda ou erro
      try {
        setLoading(true);
        setError(null);
        const data = await AnswerSheetPageService.getAnswerSheetData(idUsuarioNum, examIdResolved);
        setQuestions(data.questions || []);
        setUserAnswers(data.userAnswers || {});
        setCorrectAnswers(data.correctAnswers || {});
        console.log('[AnswerSheetPage] perQuestionMapping:', data.meta?.perQuestionMapping);
      } catch (e) {
        console.error("Erro ao buscar gabarito", e);
        setError("Erro ao carregar gabarito");
      } finally {
        setLoading(false);
      }
    }
    loadAnswerSheet();
  }, [attemptLookupDone, examIdResolved, idUsuarioNum]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-30 pb-20">
      <BackButton to={idUsuarioNum ? `/participantes/${idUsuarioNum}/avaliacoes` : null} />
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />
      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Gabarito - Avaliação</TituloPrincipal>
          {/* Resumo rápido de acertos */}
          {!loading && !error && questions.length > 0 && (
            (() => {
              const total = questions.length;
              let acertos = 0;
              const detalhes = [];
              questions.forEach(q => {
                const qid = q.id;
                if (qid != null && userAnswers[qid] != null && correctAnswers[qid] != null) {
                  const acertou = String(userAnswers[qid]) === String(correctAnswers[qid]);
                  if (acertou) acertos += 1;
                  detalhes.push({
                    id: qid,
                    acertou,
                    usuario: String(userAnswers[qid]),
                    correta: String(correctAnswers[qid])
                  });
                }
              });
              return (
                <div className="mt-8 flex justify-center">
                  <div className="text-2xl md:text-3xl text-gray-800 font-bold tracking-wide text-center">
                    Nota {acertos}/{total}
                  </div>
                </div>
              );
            })()
          )}
        </div>
        <div className="mt-8 w-full">
          {loading && <div>Carregando...</div>}
          {!loading && error && (
            <div className="text-red-500">{error}</div>
          )}
          {!loading && !error && questions.length === 0 && attemptLookupDone && examIdResolved && (
            <div className="text-gray-600">Nenhuma questão encontrada para esta avaliação.</div>
          )}
          {!loading && !error && questions.length > 0 && (
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
