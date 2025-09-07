import React from 'react';

function ExamViewer({ questions = [], userAnswers = {}, correctAnswers = {} }) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const getAlternativeClass = (questionId, alternativeId) => {
    const userAnswer = userAnswers[questionId];
    const correctAnswer = correctAnswers[questionId];
    const isUserAnswer = userAnswer === alternativeId;
    const isCorrect = correctAnswer === alternativeId;

    if (isUserAnswer && isCorrect) {
      return 'bg-green-200 border-green-400'; // Verde para resposta certa do usuário
    } else if (isUserAnswer && !isCorrect) {
      return 'bg-red-200 border-red-400'; // Vermelho para resposta errada do usuário
    } else if (!isUserAnswer && isCorrect) {
      return 'bg-yellow-200 border-yellow-400'; // Amarelo para a resposta certa quando usuário errou
    } else {
      return 'bg-gray-200 border-gray-400'; // Normal
    }
  };

  return (
    <div className="w-[70rem] mx-auto bg-[#1D262D] rounded-lg p-6">
      {/* Empty State */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-6 text-lg">Nenhuma questão disponível</p>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-8">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-white rounded-lg p-6">
              {/* Question Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-black">Questão {questionIndex + 1}</h3>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-base text-gray-800">{question.text}</p>
              </div>

              {/* Alternatives */}
              <div className="space-y-3">
                {question.alternatives.map((alternative, altIndex) => (
                  <div key={alternative.id} className="flex items-center gap-4">
                    {/* Radio Button (disabled) */}
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={alternative.id}
                      checked={userAnswers[question.id] === alternative.id}
                      disabled
                      className="w-4 h-4"
                    />
                    
                    {/* Letter */}
                    <div className={`w-8 h-8 rounded border flex items-center justify-center ${getAlternativeClass(question.id, alternative.id)}`}>
                      <span className="font-bold text-black">{letters[altIndex]}</span>
                    </div>
                    
                    {/* Alternative Text */}
                    <span className="flex-1 text-base text-gray-800">{alternative.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamViewer;
