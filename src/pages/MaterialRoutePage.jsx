import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import MaterialPage from "./MaterialPage.jsx";
import StudentMaterialPage from "./StudentMaterialPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para MaterialPage - versão administrativa)
 * Tipo 2 = colaborador (vai para StudentMaterialPage - versão do aluno)
 */
export default function MaterialRoutePage() {
	const { getCurrentUserType } = useAuth();
	const userType = getCurrentUserType();

	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<MaterialPage />
			</Layout>
		);
	}

	return (
		<Layout footerType="mini" headerType="student">
			<StudentMaterialPage />
		</Layout>
	);
}