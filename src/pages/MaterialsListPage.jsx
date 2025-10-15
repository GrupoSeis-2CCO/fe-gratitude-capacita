import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddMaterialSection from "../components/AddMaterialSection.jsx";
import MaterialCard from "../components/MaterialCard.jsx";
import AddEvaluationSection from "../components/AddEvaluationSection.jsx";
import { getMateriaisPorCurso } from "../services/MaterialListPageService.js";

export default function MaterialsListPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();

	// Proteção: apenas funcionários (tipo 1) podem acessar esta página
	if (!isLoggedIn() || userType !== 1) {
		return <Navigate to="/login" replace />;
	}

	const [materials, setMaterials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingMaterial, setEditingMaterial] = useState(null);

	async function loadMaterials() {
		setLoading(true);
		try {
			const cursoId = 1; // ajuste conforme necessário ou pegue da rota/contexto
			const mats = await getMateriaisPorCurso(cursoId);
			// mapear para o formato do MaterialCard (id, title, type, description, url, hidden)
			const mapped = (mats || []).map((m, idx) => ({
				id: m.id ?? m.idApostila ?? m.idVideo ?? idx,
				title: m.titulo ?? m.nomeApostila ?? m.nomeVideo ?? `Material ${m.id ?? idx}`,
				type: m.tipo === 'video' ? 'video' : (m.tipo === 'apostila' ? 'pdf' : 'avaliacao'),
				description: m.descricao ?? m.descricaoApostila ?? m.descricaoVideo ?? '',
				url: m.url ?? m.urlArquivo ?? m.urlVideo ?? null,
				hidden: (typeof m.isApostilaOculto !== 'undefined') ? (m.isApostilaOculto === 1) : (typeof m.isVideoOculto !== 'undefined' ? (m.isVideoOculto === 1) : false)
			}));
			setMaterials(mapped);
		} catch (e) {
			console.error('Erro carregando materiais:', e);
			setMaterials([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { loadMaterials(); }, []);

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Materiais do Curso de Regularização Fundiária</TituloPrincipal>
				</div>

				<AddMaterialSection initialMaterial={editingMaterial} onAdded={() => { setEditingMaterial(null); loadMaterials(); }} onCancelEdit={() => setEditingMaterial(null)} />

				<div className="mt-8 w-full">
					{loading ? (
						<div>Carregando...</div>
					) : (
										materials.map((material, index) => (
													<MaterialCard key={`${material.type}-${material.id}`} material={material} index={index}
														onEdit={(m) => setEditingMaterial(m)}
														onActionComplete={() => loadMaterials()} />
												))
					)}
				</div>

        		<AddEvaluationSection />
			</div>

		</div>
	);
}
