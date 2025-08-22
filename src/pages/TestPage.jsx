import { useState } from "react";
import Question from "../components/Question";

function TestPage() {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const alternativas = [
    "Alternativa 1",
    "Alternativa 2",
    "Alternativa 3",
    "Alternativa 4"
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-red-100">
      <div className="w-full max-w-xl mx-auto p-2 max-h-[600px] flex flex-col justify-center">
        <div className="overflow-auto">
          <Question
            questionNumber={1}
            questionText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue."
            alternatives={alternativas}
            selectedAnswer={selected}
            correctAnswer={0}
            showResult={showResult}
            onAnswerSelect={setSelected}
          />
        </div>
        <div className="mt-4 flex gap-4 justify-center">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setShowResult(true)}
            disabled={selected === null || showResult}
          >
            Ver resultado
          </button>
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            onClick={() => { setSelected(null); setShowResult(false); }}
          >
            Resetar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
