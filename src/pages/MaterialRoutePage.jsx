import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import MaterialPage from "./MaterialPage.jsx";
import StudentMaterialPage from "./StudentMaterialPage.jsx";
import Layout from "../Layout.jsx";
import Button from "../components/Button.jsx"; // keep for other actions if needed

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para MaterialPage - versão administrativa)
 * Tipo 2 = colaborador (vai para StudentMaterialPage - versão do aluno)
 * 
 * IMPORTANTE: Esta página controla o acesso baseado no tipo de usuário
 * Evita que usuários acessem páginas incorretas via URL direta
 */
export default function MaterialRoutePage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const navigate = useNavigate();
	const { idCurso } = useParams();

	// Se não estiver logado, redireciona para login
	if (!isLoggedIn()) {
		return <Navigate to="/login" replace />;
	}

	// Se o tipo de usuário for inválido, redireciona para login
	if (!userType || (userType !== 1 && userType !== 2)) {
		return <Navigate to="/login" replace />;
	}

	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<div className="relative">
					{/* BackButton removido - gerenciado pelo Header */}
				</div>
				<MaterialPage />
			</Layout>
		);
	}

	return (
		<Layout footerType="mini" headerType="student">
			<div className="relative">
				{/* BackButton removido - gerenciado pelo Header */}
			</div>
			<StudentMaterialPage />
		</Layout>
	);
}