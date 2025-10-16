import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { createExam } from '../services/CreateExamPageService.js';

function ExamBuilder({ cursoId = 1, onExamCreated = null }) {
  const [questions, setQuestions] = useState([]);
  const [minScore, setMinScore] = useState('');
  const [showMinScoreModal, setShowMinScoreModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'info', actions: null });
  const [pendingClearAll, setPendingClearAll] = useState(false);
  const MAX_QUESTIONS = 20; // Limite máximo de questões

  const updateQuestionText = (questionId, text) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const updateAlternativeText = (questionId, altId, text) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            alternatives: q.alternatives.map(alt =>
              alt.id === altId ? { ...alt, text } : alt
            )
          }
        : q
    ));
  };

  const toggleCorrectAnswer = (questionId, altId) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            alternatives: q.alternatives.map(alt => ({
              ...alt,
              isCorrect: alt.id === altId ? !alt.isCorrect : false
            }))
          }
        : q
    ));
  };

  const addAlternative = (questionId) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            alternatives: [
              ...q.alternatives,
              { 
                id: Math.max(...q.alternatives.map(a => a.id)) + 1, 
                text: '', 
                isCorrect: false 
              }
            ]
          }
        : q
    ));
  };

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions(prev => [
      ...prev,
      {
        id: newId,
        text: '',
        alternatives: [
          { id: 1, text: '', isCorrect: false },
          { id: 2, text: '', isCorrect: false },
          { id: 3, text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const handleSaveExam = async () => {
    setError(null);
    setLoading(true);
    try {
      // Validações
      if (questions.length === 0) {
        setModal({
          open: true,
          title: 'Atenção',
          message: 'Adicione pelo menos uma questão antes de concluir',
          type: 'warning',
          actions: null
        });
        setLoading(false);
        return;
      }
      if (!minScore || minScore === '' || Number(minScore) < 0 || Number(minScore) > 10) {
        setModal({
          open: true,
          title: 'Atenção',
          message: 'Defina uma nota mínima válida (0-10) antes de concluir',
          type: 'warning',
          actions: null
        });
        setLoading(false);
        return;
      }
      // Transformar dados do frontend para formato do backend
      const examData = {
        fkCurso: cursoId, // Backend espera fkCurso
        notaMinima: Number(minScore),
        questoes: questions.map((q, qIdx) => {
          const correctAlt = q.alternatives.find(alt => alt.isCorrect);
          if (!correctAlt) {
            throw new Error(`Selecione a alternativa correta na questão ${qIdx + 1}.`);
          }
          // Encontrar o índice (ordemAlternativa) da alternativa correta
          const correctAltIndex = q.alternatives.findIndex(alt => alt.isCorrect);
          if (correctAltIndex === -1) {
            throw new Error(`Questão ${qIdx + 1}: erro ao identificar alternativa correta`);
          }
          return {
            enunciado: q.text.trim(),
            numeroQuestao: qIdx + 1,
            alternativas: q.alternatives.map((alt, altIdx) => ({
              texto: alt.text.trim(),
              ordemAlternativa: altIdx
            })),
            fkAlternativaCorreta: correctAltIndex // Enviar o índice da alternativa correta
          };
        })
      };
      console.log('[ExamBuilder] Dados enviados ao backend:', JSON.stringify(examData, null, 2));
      const createdExam = await createExam(examData);
      setModal({
        open: true,
        title: 'Sucesso',
        message: 'Avaliação criada com sucesso!',
        type: 'success',
        actions: null
      });
      // Reset form
      setQuestions([]);
      setMinScore('');
      // Callback para página pai
      if (onExamCreated) {
        onExamCreated(createdExam);
      }
    } catch (err) {
      // Tratamento especial para erro 409 (avaliação já existe)
      let msg = err?.message || 'Erro ao salvar avaliação';
      if (msg.includes('409') || msg.toLowerCase().includes('existe uma avaliação')) {
        msg = 'Já existe uma avaliação cadastrada para este curso.';
      }
      setModal({
        open: true,
        title: 'Erro',
        message: msg,
        type: 'error',
        actions: null
      });
      // Remover setError(msg) para não exibir na tela
      console.error('Erro ao salvar avaliação:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearAll = () => {
    if (questions.length === 0) {
      setModal({
        open: true,
        title: 'Atenção',
        message: 'Não há questões para limpar',
        type: 'warning',
        actions: null
      });
      return;
    }
    setPendingClearAll(true);
    setModal({
      open: true,
      title: 'Limpar Tudo',
      message: 'Tem certeza que deseja limpar todas as questões?',
      type: 'warning',
      actions: (
        <>
          <Button
            variant="Cancel"
            label="Cancelar"
            onClick={() => {
              setModal(m => ({ ...m, open: false }));
              setPendingClearAll(false);
            }}
          />
          <button
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            onClick={() => {
              setQuestions([]);
              setMinScore('');
              setModal(m => ({ ...m, open: false }));
              setPendingClearAll(false);
            }}
            autoFocus
          >Limpar</button>
        </>
      )
    });
  };

  return (
    <div className="w-[60rem] mx-auto bg-[#1D262D] rounded-lg p-6">
      {/* Modal customizado para feedback e confirmação */}
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        actions={modal.actions}
      />
      {/* Error Message removido para evitar exibição duplicada */}
      
      {/* Header Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="Default"
          onClick={() => setShowMinScoreModal(true)}
          label={minScore ? `Nota mínima: ${minScore}` : "Inserir acertos mínimos"}
        />
        
        <div className="flex gap-4">
          <Button 
            variant="Confirm" 
            label={loading ? "Salvando..." : "Concluir"}
            onClick={handleSaveExam}
            disabled={loading || questions.length === 0}
          />
          <Button 
            variant="Exit" 
            label="Limpar Tudo" 
            onClick={handleClearAll}
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Min Score Modal (com blur e animação) */}
      <Modal
        open={showMinScoreModal}
        title="Nota Mínima para Aprovação"
        message={
          <div>
            <p className="text-gray-600 mb-4">Defina a nota mínima (0-10) que o aluno precisa atingir:</p>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg mb-4"
              placeholder="Ex: 6"
              autoFocus
            />
          </div>
        }
        type="info"
        onClose={() => setShowMinScoreModal(false)}
        actions={
          <>
            <Button
              variant="Cancel"
              label="Cancelar"
              onClick={() => setShowMinScoreModal(false)}
            />
            <Button
              variant="Confirm"
              label="Confirmar"
              onClick={() => {
                if (minScore && Number(minScore) >= 0 && Number(minScore) <= 10) {
                  setShowMinScoreModal(false);
                } else {
                  setModal({
                    open: true,
                    title: 'Nota inválida',
                    message: 'Digite uma nota válida entre 0 e 10',
                    type: 'warning',
                    actions: null
                  });
                }
              }}
            />
          </>
        }
      />

      {/* Empty State - Show when no questions */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-6 text-lg">Nenhuma questão adicionada ainda</p>
          <Button 
            variant="Default" 
            onClick={addQuestion}
            label="Adicionar Pergunta"
          />
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-8">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-white rounded-lg p-6">
              {/* Question Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">Questão {questionIndex + 1}</h3>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Question Text Input */}
              <div className="mb-6">
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestionText(question.id, e.target.value)}
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue."
                  className="w-full h-20 p-4 border border-gray-300 rounded-lg resize-none text-base"
                />
              </div>

              {/* Alternatives */}
              <div className="space-y-3 mb-4">
                {question.alternatives.map((alternative, altIndex) => (
                  <div key={alternative.id} className="flex items-center gap-4">
                    {/* Letter as selector */}
                    <button
                      type="button"
                      className={`w-8 h-8 rounded border flex items-center justify-center font-bold transition
                        ${alternative.isCorrect ? 'bg-green-500 text-white border-green-600' : 'bg-gray-200 text-black border-gray-400 hover:bg-green-100'}`}
                      onClick={() => toggleCorrectAnswer(question.id, alternative.id)}
                      aria-label={alternative.isCorrect ? 'Alternativa correta' : 'Selecionar como correta'}
                    >
                      {letters[altIndex]}
                    </button>
                    {/* Alternative Text */}
                    <input
                      type="text"
                      value={alternative.text}
                      onChange={(e) => updateAlternativeText(question.id, alternative.id, e.target.value)}
                      placeholder="Adicionar Resposta"
                      className="flex-1 p-2 border border-gray-300 rounded text-base"
                    />
                  </div>
                ))}
              </div>

              {/* Add Alternative Button */}
              {question.alternatives.length < 8 && (
                <button
                  onClick={() => addAlternative(question.id)}
                  className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center hover:bg-gray-100 mb-4"
                >
                  <span className="text-xl font-bold text-gray-600">+</span>
                </button>
              )}
            </div>
          ))}

          {/* Add New Question Button */}
          {questions.length < MAX_QUESTIONS && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="Default" 
                onClick={addQuestion}
                label="Adicionar Nova Pergunta"
              />
            </div>
          )}

          {questions.length >= MAX_QUESTIONS && (
            <div className="mt-6 text-center">
              <p className="text-orange-400 font-semibold">
                Limite máximo de {MAX_QUESTIONS} questões atingido
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExamBuilder;
