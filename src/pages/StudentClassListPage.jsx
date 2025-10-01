import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import CourseCard from "../components/CourseCard.jsx";

export default function StudentClassListPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const navigate = useNavigate();

	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}
	
	// Mock data baseado no Figma - participantes de cursos
	const mockCourses = [
		{
			id: "x",
			title: "Curso x",
			imageUrl: "https://via.placeholder.com/192x128",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: "00",
				students: "00", 
				hours: "00:00h"
			}
		},
		{
			id: "y",
			title: "Curso y", 
			imageUrl: "https://via.placeholder.com/192x128",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: "00",
				students: "00",
				hours: "00:00h"
			}
		},
		{
			id: "z",
			title: "Curso z",
			imageUrl: "https://via.placeholder.com/192x128", 
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit consec adiscing elasit.",
			stats: {
				materials: "00",
				students: "00",
				hours: "00:00h"
			}
		}
	];

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Participantes do Curso x</TituloPrincipal>
				</div>

				{/* Dropdown para ordenação */}
				<div className="mb-8">
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-700">Ordenar por</span>
						<select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
							<option value="">Selecione</option>
							<option value="nome">Nome</option>
							<option value="progresso">Progresso</option>
							<option value="data">Data de inscrição</option>
						</select>
					</div>
				</div>

				{/* Lista de cursos */}
				<div className="mt-8 w-full space-y-4">
					{mockCourses.map((course, index) => (
						<div key={course.id} className="relative">
							
							<CourseCard 
								course={course} 
								onClick={() => navigate(`/cursos/${course.id}/material`)} 
							/>
						</div>
					))}
				</div>
			</div>

		</div>
	);
}