import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import UserExamsPage from "./UserExamsPage.jsx";
import StudentUserExamsPage from "./StudentUserExamsPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para UserExamsPage - versão administrativa para ver avaliações de qualquer usuário)
 * Tipo 2 = colaborador (vai para StudentUserExamsPage - versão para ver apenas suas próprias avaliações)
 * 
 * IMPORTANTE: Esta página controla o acesso baseado no tipo de usuário
 * Evita que usuários acessem páginas incorretas via URL direta
 */
export default function UserExamsRoutePage() {
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

	// Se for tipo 1 (funcionário), mostra a página administrativa de avaliações
	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<UserExamsPage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página com suas próprias avaliações
	return (
		<Layout footerType="mini" headerType="student">
			<StudentUserExamsPage />
		</Layout>
	);
}