import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate, useParams } from "react-router-dom";
import ExamPage from "./ExamPage.jsx";
import StudentExamPage from "./StudentExamPage.jsx";
import Layout from "../Layout.jsx";
import ExamPageService from "../services/ExamPageService.js";

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
	const { idCurso, idAvaliacao } = useParams();
	const [resolvedExamId, setResolvedExamId] = useState(idAvaliacao ? Number(idAvaliacao) : null);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);

	// Se não estiver logado, redireciona para login
	if (!isLoggedIn()) {
		return <Navigate to="/login" replace />;
	}

	// Se o tipo de usuário for inválido, redireciona para login
	if (!userType || (userType !== 1 && userType !== 2)) {
		return <Navigate to="/login" replace />;
	}

	// Se for tipo 1 (funcionário), mostra a página administrativa de exames
	useEffect(() => {
		async function resolveExam() {
			setLoadError(null);
			if (idAvaliacao) return; // already have explicit exam id in URL
			if (!idCurso) return;
			setLoading(true);
			try {
				const exam = await ExamPageService.getExamByCourseId(Number(idCurso));
				if (exam && exam.idAvaliacao) {
					setResolvedExamId(Number(exam.idAvaliacao));
				} else {
					setLoadError('Avaliação não encontrada para este curso');
				}
			} catch (err) {
				console.error('[ExamRoutePage] erro ao buscar avaliação por curso', err);
				setLoadError('Erro ao carregar avaliação');
			} finally {
				setLoading(false);
			}
		}
		resolveExam();
	}, [idCurso, idAvaliacao]);

	if (userType === 1) {
		return (
			<Layout footerType="mini" headerType="default">
				{loading && <div className="p-4">Carregando avaliação...</div>}
				{loadError && <div className="p-4 text-red-600">{loadError}</div>}
				{!loading && !loadError && resolvedExamId && <ExamPage examId={resolvedExamId} />}
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página para fazer a prova
	return (
		<Layout footerType="mini" headerType="student">
			{loading && <div className="p-4">Carregando avaliação...</div>}
			{loadError && <div className="p-4 text-red-600">{loadError}</div>}
			{!loading && !loadError && resolvedExamId && <StudentExamPage examId={resolvedExamId} />}
		</Layout>
	);
}