import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddMaterialSection from "../components/AddMaterialSection.jsx";
import MaterialCard from "../components/MaterialCard.jsx";
import AddEvaluationSection from "../components/AddEvaluationSection.jsx";

export default function MaterialsListPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();

	// Proteção: apenas funcionários (tipo 1) podem acessar esta página
	if (!isLoggedIn() || userType !== 1) {
		return <Navigate to="/login" replace />;
	}
	const mockMaterials = [
		{
			id: 1,
			title: "Introdução à Regularização Fundiária",
			type: "video",
			description: "Este material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor."
		},
		{
			id: 2,
			title: "Marco Legal da Regularização Fundiária",
			type: "pdf",
			description: "Documento completo sobre o marco legal brasileiro para regularização fundiária, incluindo a Lei 13.465/2017 e suas implicações práticas para municípios e beneficiários."
		},
		{
			id: 3,
			title: "Procedimentos Administrativos",
			type: "video",
			description: "Vídeo explicativo sobre os procedimentos administrativos necessários para implementar projetos de regularização fundiária em áreas urbanas e rurais."
		},
		{
			id: 4,
			title: "Instrumentos Urbanísticos",
			type: "pdf",
			description: "Guia prático dos principais instrumentos urbanísticos utilizados em processos de regularização fundiária, com exemplos e casos práticos."
		},
		{
			id: 5,
			title: "Participação Social e Comunidade",
			type: "video",
			description: "Como envolver a comunidade nos processos de regularização fundiária, garantindo participação social efetiva e transparente."
		}
	];

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Materiais do Curso de Regularização Fundiária</TituloPrincipal>
				</div>

				<AddMaterialSection />

				<div className="mt-8 w-full">
					{mockMaterials.map((material, index) => (
						<MaterialCard key={material.id} material={material} index={index} />
					))}
				</div>

        <AddEvaluationSection />
			</div>

		</div>
	);
}
