import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Table from "../components/Table";
import TituloPrincipal from "../components/TituloPrincipal";
import GradientSideRail from "../components/GradientSideRail.jsx";

export default function UserExamsPage() {
	const navigate = useNavigate();
	const params = useParams();
	const idUsuario = params.id ?? params.idUsuario ?? params.idAluno;

	// Columns and mock data to mimic the layout shown
	const columns = [
		{ header: "Curso", accessor: "curso" },
		{ header: "Data da Tentativa", accessor: "data" },
		{ header: "Nota", accessor: "nota" },
	];

	const data = [
		{ id: 1, curso: "Curso X", data: "21 de abril de 2025, 15h53", nota: "9/10" },
		{ id: 2, curso: "Curso X", data: "21 de abril de 2025, 15h33", nota: "7/10" },
		{ id: 3, curso: "Curso X", data: "21 de abril de 2025, 15h13", nota: "5/10" },
		// Empty rows to match the visual spacing on the mock
		...Array.from({ length: 9 }).map((_, index) => ({ id: null, curso: "-", data: "-", nota: "-" })),
	];

	return (
		<div className="relative min-h-screen flex bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="max-w-6xl mx-auto">
				<TituloPrincipal>Provas do Colaborador y</TituloPrincipal>

				{/* Framed table area resembling the mock */}
				<div className="mt-10 w-[65rem] h-[45rem] justify-center rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
					<Table
						columns={columns}
						data={data}
						headerClassName="bg-[#0067B1] text-white text-[1.125rem]"
						rowClassName="odd:bg-[#DAEEFF] even:bg-[#B5DEFF] hover:bg-[#bcdfff] transition-colors"
						onClickRow={(row) => {
							// Only navigate if the row has valid data (not empty placeholder rows)
							if (row.id && row.curso !== "-") {
								navigate(`/participantes/${idUsuario}/avaliacoes/${row.id}`);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}
