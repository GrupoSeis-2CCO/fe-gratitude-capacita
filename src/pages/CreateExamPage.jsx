import React from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import ExamBuilder from "../components/ExamBuilder.jsx";

export default function CreateExamPage() {
	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-none mx-auto flex-grow">
				<div className="max-w-6xl mx-auto">
					<TituloPrincipal>Avaliação Curso 1 - Introdução</TituloPrincipal>
				</div>

				<div className="mt-8 w-full">
					<ExamBuilder />
				</div>
			</div>

		</div>
	);
}