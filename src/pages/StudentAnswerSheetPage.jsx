import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamViewer from "../components/ExamViewer.jsx";
import Button from "../components/Button.jsx";

export default function StudentAnswerSheetPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const { idCurso, tentativa } = useParams();
	const navigate = useNavigate();

	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}

	// Mock data - Informações da tentativa
	const mockAnswerSheet = {
		examTitle: "Avaliação de Regularização Fundiária",
		studentName: "Nome do Colaborador",
		attemptDate: "15/09/2025 14:30",
		score: 7,
		maxScore: 10,
		duration: "45 minutos"
	};

	// Mock data das questões - igual ao AnswerSheetPage
	const mockQuestions = [
		{
			id: 1,
			text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
			alternatives: [
				{ id: 1, text: "Alternativa 1" },
				{ id: 2, text: "Alternativa 2" },
				{ id: 3, text: "Alternativa 3" },
				{ id: 4, text: "Alternativa 4" }
			]
		},
		{
			id: 2,
			text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
			alternatives: [
				{ id: 1, text: "Alternativa 1" },
				{ id: 2, text: "Alternativa 2" },
				{ id: 3, text: "Alternativa 3" },
				{ id: 4, text: "Alternativa 4" }
			]
		},
		{
			id: 3,
			text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue.",
			alternatives: [
				{ id: 1, text: "Alternativa 1" },
				{ id: 2, text: "Alternativa 2" },
				{ id: 3, text: "Alternativa 3" },
				{ id: 4, text: "Alternativa 4" }
			]
		}
	];

	const mockUserAnswers = {
		1: 2, // Usuário escolheu Alternativa 2 (errado)
		2: 3, // Usuário escolheu Alternativa 3 (certo)
		3: 1  // Usuário escolheu Alternativa 1 (errado)
	};

	const mockCorrectAnswers = {
		1: 3, // Resposta correta: Alternativa 3
		2: 3, // Resposta correta: Alternativa 3
		3: 2  // Resposta correta: Alternativa 2
	};

	const handleBackToExams = () => {
		navigate(`/avaliacoes`);
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="max-w-4xl mx-auto">
					<TituloPrincipal>Gabarito - {mockAnswerSheet.examTitle}</TituloPrincipal>
				</div>

				{/* Informações da tentativa */}
				<div className="max-w-4xl mx-auto mb-8">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4">Informações da Tentativa</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<p><strong>Data:</strong> {mockAnswerSheet.attemptDate}</p>
								<p><strong>Duração:</strong> {mockAnswerSheet.duration}</p>
							</div>
							<div>
								<p><strong>Nota:</strong> {mockAnswerSheet.score}/{mockAnswerSheet.maxScore}</p>
								<p><strong>Aproveitamento:</strong> {((mockAnswerSheet.score / mockAnswerSheet.maxScore) * 100).toFixed(1)}%</p>
							</div>
							<div className="flex justify-end">
								<Button
									label="Voltar às Minhas Avaliações"
									variant="default"
									onClick={handleBackToExams}
								/>
							</div>
						</div>
					</div>
				</div>

					{/* ExamViewer - igual ao AnswerSheetPage */}
				<div className="mt-8 max-w-4xl mx-auto w-full">
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