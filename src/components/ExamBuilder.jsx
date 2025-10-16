import React, { useState, useEffect } from 'react';
import Button from './Button';
import { createExam } from '../services/CreateExamPageService.js';

function ExamBuilder({ cursoId = 1, initialData = null, onExamCreated = null, onExamSaved = null, editMode = false }) {
  const [questions, setQuestions] = useState([]);
  const [minScore, setMinScore] = useState('');
  // Preencher dados iniciais para edição
  useEffect(() => {
    if (editMode && initialData) {
      setMinScore(initialData.notaMinima?.toString() || '');
      setQuestions(
        (initialData.questoes || []).map((q, idx) => ({
          id: q.idQuestao || idx + 1,
          text: q.enunciado || '',
          alternatives: (q.alternativas || []).map((alt, aidx) => ({
            id: alt.idAlternativa || aidx + 1,
            text: alt.texto || '',
            isCorrect: (q.fkAlternativaCorreta !== undefined && alt.idAlternativa === q.fkAlternativaCorreta) || alt.isCorrect || false
          }))
        }))
      );
    }
  }, [editMode, initialData]);
  const [showMinScoreModal, setShowMinScoreModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        throw new Error(editMode ? 'Adicione pelo menos uma questão antes de atualizar' : 'Adicione pelo menos uma questão antes de concluir');
      }
      
      if (!minScore || minScore === '' || Number(minScore) < 0 || Number(minScore) > 10) {
        throw new Error(editMode ? 'Defina uma nota mínima válida (0-10) antes de atualizar' : 'Defina uma nota mínima válida (0-10) antes de concluir');
      }
      
      // Transformar dados do frontend para formato do backend
      const examData = {
        fkCurso: cursoId, // Backend espera fkCurso
        notaMinima: Number(minScore),
        questoes: questions.map((q, qIdx) => {
          const correctAlt = q.alternatives.find(alt => alt.isCorrect);
          if (!correctAlt) {
            throw new Error(`Questão ${qIdx + 1}: marque a alternativa correta`);
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
      if (editMode && onExamSaved) {
        await onExamSaved(examData);
        alert('Avaliação atualizada com sucesso!');
      } else {
        const createdExam = await createExam(examData);
        alert('Avaliação criada com sucesso!');
        // Reset form
        setQuestions([]);
        setMinScore('');
        // Callback para página pai
        if (onExamCreated) {
          onExamCreated(createdExam);
        }
      }
    } catch (err) {
      // Tratamento especial para erro 409 (avaliação já existe)
      let msg = err?.message || 'Erro ao salvar avaliação';
      if (msg.includes('409') || msg.toLowerCase().includes('existe uma avaliação')) {
        msg = 'Já existe uma avaliação cadastrada para este curso.';
      }
      setError(msg);
      console.error('Erro ao salvar avaliação:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearAll = () => {
    if (questions.length === 0) {
      alert('Não há questões para limpar');
      return;
    }
    
    if (confirm('Tem certeza que deseja limpar todas as questões?')) {
      setQuestions([]);
      setMinScore('');
      setError(null);
    }
  };

  return (
    <div className="w-[60rem] mx-auto bg-[#1D262D] rounded-lg p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-sm animate-pulse">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <span className="font-bold text-red-700">Erro:</span>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
      
      {/* Header Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="Default"
          onClick={() => setShowMinScoreModal(true)}
          label={minScore ? `Nota mínima: ${minScore}` : "Inserir acertos mínimos"}
        />
        
        <div className="flex gap-4">
          <Button 
            variant={editMode ? "Primary" : "Confirm"} 
            label={loading ? "Salvando..." : (editMode ? "Atualizar" : "Concluir")}
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
      
      {/* Min Score Modal */}
      {showMinScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Nota Mínima para Aprovação</h3>
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
            />
            <div className="flex gap-4 justify-end">
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
                    alert('Digite uma nota válida entre 0 e 10');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

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
                    {/* Letter */}
                    <div className="w-8 h-8 bg-gray-200 rounded border border-gray-400 flex items-center justify-center">
                      <span className="font-bold text-black">{letters[altIndex]}</span>
                    </div>
                    
                    {/* Alternative Text */}
                    <input
                      type="text"
                      value={alternative.text}
                      onChange={(e) => updateAlternativeText(question.id, alternative.id, e.target.value)}
                      placeholder="Adicionar Resposta"
                      className="flex-1 p-2 border border-gray-300 rounded text-base"
                    />
                    
                    {/* Correct Answer Checkbox */}
                    <div className="w-6 h-6">
                      <input
                        type="checkbox"
                        checked={alternative.isCorrect}
                        onChange={() => toggleCorrectAnswer(question.id, alternative.id)}
                        className="w-full h-full"
                      />
                    </div>
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
