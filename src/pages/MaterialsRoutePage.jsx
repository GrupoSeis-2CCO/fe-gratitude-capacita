import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router-dom";
import MaterialsListPage from "./MaterialsListPage.jsx";
import StudentMaterialsListPage from "./StudentMaterialsListPage.jsx";
import Layout from "../Layout.jsx";
import { ensureMatricula, updateUltimoAcesso } from "../services/MatriculaService.js";

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
	const { idCurso } = useParams();
	const navigate = useNavigate();

	// Ao entrar na rota de materiais como colaborador, garante matrícula e atualiza o último acesso
	useEffect(() => {
		async function run() {
			try {
				if (!idCurso) return;
				if (typeof userType !== 'number' || userType !== 2) return; // apenas colaborador

				// Recupera o id do usuário do localStorage ou do token JWT
				let uid = undefined;
				try {
					const raw = localStorage.getItem('usuarioId');
					if (raw) uid = Number(String(raw).trim());
				} catch (_) { /* noop */ }
				if (!uid) {
					try {
						const token = localStorage.getItem('token');
						if (token) {
							const parts = token.split('.');
							if (parts.length === 3) {
								const payload = JSON.parse(atob(parts[1]));
								const pId = payload.id || payload.userId || payload.user_id || payload.usuarioId || payload.usuario_id || payload.sub;
								if (pId != null) uid = Number(pId);
							}
						}
					} catch (_) { /* noop */ }
				}
				const courseId = Number(idCurso);
				if (!uid || !courseId) return;

				// Evita 404 garantindo matrícula; depois atualiza último acesso desta matrícula
				try { await ensureMatricula(uid, courseId); } catch (_) { /* segue mesmo se falhar */ }
				await updateUltimoAcesso(uid, courseId);
			} catch (e) {
				// Não bloqueia UX por isso
				try { console.debug('[MaterialsRoutePage] último acesso não atualizado:', e?.response?.data || e?.message); } catch (_) {}
			}
		}
		run();
	}, [idCurso, userType]);

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
				<div className="mb-4">
					<button className="px-3 py-1 rounded bg-white border text-gray-700" onClick={() => navigate('/cursos')}>← Voltar para Cursos</button>
				</div>
				<MaterialsListPage />
			</Layout>
		);
	}

	// Se for tipo 2 (colaborador), mostra a página do aluno para visualizar materiais
	return (
		<Layout footerType="mini" headerType="student">
			<div className="mb-4">
				<button className="px-3 py-1 rounded bg-white border text-gray-700" onClick={() => navigate('/cursos')}>← Voltar para Cursos</button>
			</div>
			<StudentMaterialsListPage />
		</Layout>
	);
}