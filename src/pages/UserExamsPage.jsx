import React from "react";
import Table from "../components/Table";
import TituloPrincipal from "../components/TituloPrincipal";
import GradientSideRail from "../components/GradientSideRail";

export default function UserExamsPage() {
	// Columns and mock data to mimic the layout shown
	const columns = [
		{ header: "Curso", accessor: "curso" },
		{ header: "Data da Tentativa", accessor: "data" },
		{ header: "Nota", accessor: "nota" },
	];

	const data = [
		{ curso: "Curso X", data: "21 de abril de 2025, 15h53", nota: "9/10" },
		{ curso: "Curso X", data: "21 de abril de 2025, 15h33", nota: "7/10" },
		{ curso: "Curso X", data: "21 de abril de 2025, 15h13", nota: "5/10" },
		// Empty rows to match the visual spacing on the mock
		...Array.from({ length: 9 }).map(() => ({ curso: "-", data: "-", nota: "-" })),
	];

	return (
		<div className="relative min-h-screen bg-[#0F1418] pt-[12.5rem] pb-[6.25rem] px-8">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-4" topColor="#0067B1" bottomColor="#ff8800" />
			<GradientSideRail className="right-4" topColor="#0067B1" bottomColor="#ff8800" />

			<div className="max-w-6xl mx-auto">
				<TituloPrincipal>Provas do Colaborador y</TituloPrincipal>

				{/* Framed table area resembling the mock */}
				<div className="mt-6 rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
					<Table
						columns={columns}
						data={data}
						headerClassName="bg-[#0067B1] text-white text-[1.125rem]"
						rowClassName="odd:bg-[#DAEEFF] even:bg-[#B5DEFF] hover:bg-[#bcdfff] transition-colors"
					/>
				</div>
			</div>
		</div>
	);
}
