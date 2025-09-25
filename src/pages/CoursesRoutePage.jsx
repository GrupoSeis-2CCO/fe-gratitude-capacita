import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import ClassListPage from "./ClassListPage.jsx";
import StudentClassListPage from "./StudentClassListPage.jsx";
import Layout from "../Layout.jsx";

/**
 * Componente que redireciona para a página correta baseado no tipo do usuário
 * Tipo 1 = funcionário (vai para ClassListPage)
 * Tipo 2 = colaborador (vai para StudentClassListPage)
 */
export default function CoursesRoutePage() {
	const { getCurrentUserType } = useAuth();
	const userType = getCurrentUserType();

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