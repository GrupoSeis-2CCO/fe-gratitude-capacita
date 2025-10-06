import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import MaterialsListPage from "./MaterialsListPage.jsx";
import StudentMaterialsListPage from "./StudentMaterialsListPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para MaterialsListPage - versão administrativa)
 * Tipo 2 = colaborador (vai para StudentMaterialsListPage - versão do aluno)
 * 
 * IMPORTANTE: Esta página controla o acesso baseado no tipo de usuário
 * Evita que colaboradores acessem páginas administrativas via URL direta
 */
export default function MaterialsRoutePage() {
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

	// Se for tipo 1 (funcionário), mostra a página administrativa de materiais
	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<MaterialsListPage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página do aluno para visualizar materiais
	return (
		<Layout footerType="mini" headerType="student">
			<StudentMaterialsListPage />
		</Layout>
	);
}