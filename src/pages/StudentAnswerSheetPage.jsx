import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button.jsx";

export default function StudentAnswerSheetPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const { idUsuario, idTentativa } = useParams();
	const navigate = useNavigate();

	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}

	// Mock data - Gabarito da tentativa do colaborador
	const mockAnswerSheet = {
		examTitle: "Avaliação de Regularização Fundiária",
		studentName: "Nome do Colaborador",
		attemptDate: "15/09/2025 14:30",
		score: 8.5,
		maxScore: 10,
		duration: "45 minutos",
		questions: [
			{
				id: 1,
				question: "O que é regularização fundiária?",
				studentAnswer: "É o processo de formalização...",
				correctAnswer: "É o processo de formalização...",
				isCorrect: true,
				points: 2,
				maxPoints: 2
			},
			{
				id: 2,
				question: "Quais são os documentos necessários?",
				studentAnswer: "CPF, RG, comprovante...",
				correctAnswer: "CPF, RG, comprovante de residência...",
				isCorrect: false,
				points: 1,
				maxPoints: 2
			}
		]
	};

	const handleBackToExams = () => {
		navigate(`/participantes/${idUsuario}/avaliacoes`);
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-8">
					<TituloPrincipal>
						Meu Gabarito - {mockAnswerSheet.examTitle}
					</TituloPrincipal>
				</div>

				{/* Informações da tentativa */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Informações da Tentativa</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p><strong>Data:</strong> {mockAnswerSheet.attemptDate}</p>
							<p><strong>Duração:</strong> {mockAnswerSheet.duration}</p>
						</div>
						<div>
							<p><strong>Nota:</strong> {mockAnswerSheet.score}/{mockAnswerSheet.maxScore}</p>
							<p><strong>Aproveitamento:</strong> {((mockAnswerSheet.score / mockAnswerSheet.maxScore) * 100).toFixed(1)}%</p>
						</div>
					</div>
				</div>

				{/* Questões e respostas */}
				<div className="space-y-6">
					{mockAnswerSheet.questions.map((question, index) => (
						<div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
							<div className="flex justify-between items-start mb-4">
								<h3 className="font-semibold">Questão {index + 1}</h3>
								<div className={`px-3 py-1 rounded text-sm font-medium ${
									question.isCorrect 
										? 'bg-green-100 text-green-800' 
										: 'bg-red-100 text-red-800'
								}`}>
									{question.points}/{question.maxPoints} pontos
								</div>
							</div>
							
							<p className="mb-4 font-medium">{question.question}</p>
							
							<div className="space-y-3">
								<div>
									<h4 className="font-medium text-blue-600 mb-1">Minha Resposta:</h4>
									<p className={`p-3 rounded border ${
										question.isCorrect 
											? 'bg-green-50 border-green-200' 
											: 'bg-red-50 border-red-200'
									}`}>
										{question.studentAnswer}
									</p>
								</div>
								
								{!question.isCorrect && (
									<div>
										<h4 className="font-medium text-green-600 mb-1">Resposta Correta:</h4>
										<p className="p-3 rounded border bg-green-50 border-green-200">
											{question.correctAnswer}
										</p>
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Botão voltar */}
				<div className="flex justify-center mt-8">
					<Button
						label="Voltar às Minhas Avaliações"
						variant="default"
						onClick={handleBackToExams}
						className="px-8 py-3"
					/>
				</div>
			</div>
		</div>
	);
}