import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamTaker from "../components/ExamTaker.jsx";

export default function StudentExamPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const { idCurso } = useParams();

	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}

	// Mock data - avaliação do curso
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

	const handleSubmitExam = (answers) => {
		console.log('Respostas enviadas:', answers);
		alert('Avaliação enviada com sucesso!');
		// Aqui seria feita a chamada à API para salvar as respostas
		// navigate(`/cursos/${idCurso}/material`); // Voltar aos materiais
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-none mx-auto flex-grow">
				<div className="max-w-6xl mx-auto">
					<TituloPrincipal>Avaliação de conhecimento do Curso X</TituloPrincipal>
				</div>

				<div className="mt-8 w-full">
					<ExamTaker 
						questions={mockQuestions} 
						onSubmit={handleSubmitExam}
					/>
				</div>
			</div>
		</div>
	);
}