import React, { useState } from 'react';
import Button from './Button';

function ExamBuilder() {
  const [questions, setQuestions] = useState([]);
  const [minScore, setMinScore] = useState('');
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

  return (
    <div className="w-[70rem] mx-auto bg-[#1D262D] rounded-lg p-6">
      {/* Header Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="Default"
          onClick={() => {/* Handle min score logic */}}
          label="Inserir acertos mínimos"
        />
        
        <div className="flex gap-4">
          <Button variant="Confirm" label="Concluir" />
          <Button variant="Exit" label="Excluir" />
        </div>
      </div>

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
