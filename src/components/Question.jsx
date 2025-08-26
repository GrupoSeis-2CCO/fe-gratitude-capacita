function Question({
  questionNumber = 1,
  questionText = "",
  alternatives = [],
  selectedAnswer = null,
  correctAnswer = null,
  showResult = false,
  onAnswerSelect,
  ...props
}) {
  const getAlternativeStyle = (index) => {
    if (!showResult) {
      // Estado normal - apenas mostra seleção
      return selectedAnswer === index
        ? "bg-blue-200 border-blue-500"
        : "bg-gray-50 border-gray-300 hover:bg-gray-100";
    }

    // Estado de resultado - mostra correto/incorreto
    if (index === correctAnswer) {
      return "bg-yellow-200 border-black"; // Alternativa correta (amarelo como no design)
    }
    
    if (selectedAnswer === index && index !== correctAnswer) {
      return "bg-red-400 border-black"; // Alternativa selecionada incorreta (vermelho)
    }
    
    return "bg-gray-50 border-black"; // Outras alternativas
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div 
      className="relative   w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mx-auto"
      {...props}
    >
      {/* Título da Questão */}
      <h2 className="text-2xl font-bold text-center text-black mb-6">
        Questão {questionNumber}
      </h2>

      {/* Enunciado da Questão */}
      <div className="bg-white border border-gray-700 rounded-lg p-6 mb-6 shadow-inner">
        <p className="text-2xl text-black leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Alternativas */}
      <div className="space-y-4">
        {alternatives.map((alternative, index) => (
          <button 
            key={index}
            type="button"
            className={`flex items-center w-full cursor-pointer transition-all duration-200 p-2 rounded-lg border-0 bg-transparent ${
              !showResult ? 'hover:scale-[1.01]' : ''
            }`}
            onClick={() => onAnswerSelect?.(index)}
            disabled={showResult}
          >
            {/* Letra da Alternativa */}
            <div 
              className={`w-12 h-12 border-2 rounded-sm flex items-center justify-center mr-4 transition-all duration-200 ${
                getAlternativeStyle(index)
              }`}
            >
              <span className="text-2xl font-bold text-black">
                {letters[index]}
              </span>
            </div>

            {/* Texto da Alternativa */}
            <span className="text-2xl text-black flex-1 text-left">
              {alternative}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Question;
