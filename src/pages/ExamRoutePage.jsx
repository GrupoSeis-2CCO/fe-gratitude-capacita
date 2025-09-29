import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import ExamPage from "./ExamPage.jsx";
import StudentExamPage from "./StudentExamPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para ExamPage - versão administrativa/visualização)
 * Tipo 2 = colaborador (vai para StudentExamPage - versão para fazer a prova)
 * 
 * IMPORTANTE: Esta página controla o acesso baseado no tipo de usuário
 * Evita que usuários acessem páginas incorretas via URL direta
 */
export default function ExamRoutePage() {
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

	// Se for tipo 1 (funcionário), mostra a página administrativa de exames
	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<ExamPage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página para fazer a prova
	return (
		<Layout footerType="mini" headerType="student">
			<StudentExamPage />
		</Layout>
	);
}