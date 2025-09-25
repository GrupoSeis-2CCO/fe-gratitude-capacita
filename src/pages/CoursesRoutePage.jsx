import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import ClassListPage from "./ClassListPage.jsx";
import StudentClassListPage from "./StudentClassListPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para ClassListPage)
 * Tipo 2 = colaborador (vai para StudentClassListPage)
 * 
 * IMPORTANTE: Esta página controla o acesso baseado no tipo de usuário
 * Evita que colaboradores acessem páginas de funcionários via URL direta
 */
export default function CoursesRoutePage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();

	// Se não estiver logado, redireciona para login
	if (!isLoggedIn()) {
		return <Navigate to="/login" replace />;
	}

	// Se o tipo de usuário for inválido, redireciona para login
	if (!userType || (userType !== 1 && userType !== 2)) {
		return <Navigate to="/login" replace />;
	}

	// Se for tipo 1 (funcionário), mostra a página de gerenciamento de cursos
	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<ClassListPage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página de participante dos cursos
	return (
		<Layout footerType="mini" headerType="student">
			<StudentClassListPage />
		</Layout>
	);
}