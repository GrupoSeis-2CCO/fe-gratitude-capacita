import React, { useState } from 'react';
import Button from './Button';

function ExamTaker({ questions = [], onSubmit }) {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, alternativeId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: alternativeId
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(answers);
    }
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#1D262D] rounded-lg p-4 sm:p-6">
      {/* Empty State */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-6 text-lg">Nenhuma questão disponível</p>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-6 sm:space-y-8">
          {questions.map((question, questionIndex) => (
            <div key={`q-${question.id ?? questionIndex}`} className="bg-white rounded-lg p-4 sm:p-6">
              {/* Question Header */}
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-black">Questão {questionIndex + 1}</h3>
              </div>

              {/* Question Text */}
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-800 break-words">{question.text}</p>
              </div>

              {/* Alternatives */}
              <div className="space-y-3">
                {question.alternatives.map((alternative, altIndex) => (
                  <label key={`q${question.id ?? questionIndex}-a${alternative.id ?? altIndex}`} className="flex items-start gap-3 cursor-pointer">
                    {/* Radio Button */}
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={alternative.id}
                      checked={answers[question.id] === alternative.id}
                      onChange={() => handleAnswerChange(question.id, alternative.id)}
                      className="w-4 h-4 mt-1 flex-shrink-0"
                    />
                    
                    {/* Letter */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded border border-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-black text-sm sm:text-base">{letters[altIndex]}</span>
                    </div>
                    
                    {/* Alternative Text */}
                    <span className="flex-1 text-sm sm:text-base text-gray-800 break-words">{alternative.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <Button 
              variant="Confirm" 
              onClick={handleSubmit}
              label="Submeter Prova"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamTaker;
