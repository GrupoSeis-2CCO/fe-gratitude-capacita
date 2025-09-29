import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import { ProfilePage } from "./ProfilePage.jsx";
import StudentProfile from "./StudentProfile.jsx";
import Layout from "../Layout.jsx";


export default function ProfileRoutePage() {
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

	// Se for tipo 1 (funcionário), mostra a página de perfil administrativo
	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				<ProfilePage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página de perfil do estudante
	return (
		<Layout footerType="mini" headerType="student">
			<StudentProfile />
		</Layout>
	);
}
