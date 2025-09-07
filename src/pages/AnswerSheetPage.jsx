import React from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamViewer from "../components/ExamViewer.jsx";

export default function AnswerSheetPage() {
	const mockQuestions = [
		{
			id: 1,
			text: "Qual é a capital do Brasil?",
			alternatives: [
				{ id: 1, text: "São Paulo" },
				{ id: 2, text: "Rio de Janeiro" },
				{ id: 3, text: "Brasília" },
				{ id: 4, text: "Salvador" }
			]
		},
		{
			id: 2,
			text: "Quanto é 2 + 2?",
			alternatives: [
				{ id: 1, text: "3" },
				{ id: 2, text: "4" },
				{ id: 3, text: "5" },
				{ id: 4, text: "6" }
			]
		},
		{
			id: 3,
			text: "Qual é a linguagem de programação usada neste projeto?",
			alternatives: [
				{ id: 1, text: "Python" },
				{ id: 2, text: "JavaScript" },
				{ id: 3, text: "Java" },
				{ id: 4, text: "C#" }
			]
		}
	];

	const mockUserAnswers = {
		1: 2, // Usuário escolheu Rio (errado)
		2: 2, // Usuário escolheu 4 (certo)
		3: 2  // Usuário escolheu JavaScript (certo)
	};

	const mockCorrectAnswers = {
		1: 3, // Brasília
		2: 2, // 4
		3: 2  // JavaScript
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-none mx-auto flex-grow">
				<div className="max-w-6xl mx-auto">
					<TituloPrincipal>Gabarito - Avaliação Curso 1</TituloPrincipal>
				</div>

				<div className="mt-8 w-full">
					<ExamViewer 
						questions={mockQuestions} 
						userAnswers={mockUserAnswers} 
						correctAnswers={mockCorrectAnswers} 
					/>
				</div>
			</div>

		</div>
	);
}
