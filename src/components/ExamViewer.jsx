import React from 'react';

function ExamViewer({ questions = [], userAnswers = {}, correctAnswers = {} }) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const getAlternativeClass = (questionId, alternativeId) => {
    const ua = String(userAnswers[questionId] || '');
    const ca = String(correctAnswers[questionId] || '');
    const altId = String(alternativeId);
    
    const isUserAnswer = ua === altId;
    const isCorrect = ca === altId;

    // SEMPRE destaque a alternativa correta em verde (mudança principal)
    if (isCorrect) {
      return 'bg-green-100 border-green-400';
    }

    // Vermelho quando o usuário marcou esta alternativa E ela está errada
    if (isUserAnswer && !isCorrect) {
      return 'bg-red-100 border-red-400';
    }

    // Demais ficam neutras
    return 'bg-gray-100 border-gray-300';
  };

  const getAlternativeLabel = (questionId, alternativeId) => {
    const ua = String(userAnswers[questionId] || '');
    const ca = String(correctAnswers[questionId] || '');
    const altId = String(alternativeId);
    
    const isUserAnswer = ua === altId;
    const isCorrect = ca === altId;

    if (isCorrect) {
      return (
        <span className="text-xs font-semibold text-green-700 mt-1 block">
          ✓ Resposta Correta
        </span>
      );
    }

    if (isUserAnswer && !isCorrect) {
      return (
        <span className="text-xs font-semibold text-red-700 mt-1 block">
          ✗ Sua resposta (incorreta)
        </span>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1D262D] rounded-lg p-6">
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
                <h3 className="text-xl font-bold text-gray-900">
                  Questão {questionIndex + 1}
                </h3>
              </div>

              {/* Question Text */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-base text-gray-800 leading-relaxed">
                  {question.enunciado || question.text}
                </p>
              </div>

              {/* Alternatives */}
              <div className="space-y-3">
                {(question.alternativas || question.alternatives || []).map((alternative, altIndex) => {
                  const altClass = getAlternativeClass(question.id, alternative.id);
                  const altLabel = getAlternativeLabel(question.id, alternative.id);
                  
                  return (
                    <div
                      key={alternative.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${altClass}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Letter Badge */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-bold text-gray-700">
                          {letters[altIndex]}
                        </div>
                        
                        {/* Alternative Content */}
                        <div className="flex-1">
                          <p className="text-base text-gray-900">
                            {alternative.texto || alternative.text}
                          </p>
                          {altLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamViewer;
