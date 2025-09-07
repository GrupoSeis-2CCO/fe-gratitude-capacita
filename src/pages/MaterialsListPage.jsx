import React from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddMaterialSection from "../components/AddMaterialSection.jsx";
import MaterialCard from "../components/MaterialCard.jsx";
import AddEvaluationSection from "../components/AddEvaluationSection.jsx";

export default function MaterialsListPage() {
	const mockMaterials = [
		{
			id: 1,
			title: "Introdução ao React",
			type: "video",
			description: "Neste vídeo, cobrimos os conceitos básicos do React, incluindo componentes, props e estado. Ideal para iniciantes que desejam uma base sólida."
		},
		{
			id: 2,
			title: "Guia de Estilo Tailwind CSS",
			type: "pdf",
			description: "Um guia completo em PDF com as principais classes utilitárias do Tailwind CSS, exemplos práticos e dicas para otimizar seu fluxo de trabalho."
		},
    {
			id: 3,
			title: "Hooks Avançados",
			type: "video",
			description: "Explore hooks avançados como useReducer, useCallback e useMemo para otimizar o desempenho e gerenciar estados complexos em suas aplicações React."
		}
	];

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Materiais do Curso de React</TituloPrincipal>
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
