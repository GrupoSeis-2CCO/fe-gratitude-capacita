import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Table from "../components/Table";
import TituloPrincipal from "../components/TituloPrincipal";
import GradientSideRail from "../components/GradientSideRail.jsx";

export default function StudentUserExamsPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const navigate = useNavigate();
	const params = useParams();
	const idUsuario = params.id ?? params.idUsuario ?? params.idAluno;

	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}

	// Columns and mock data para as avaliações do colaborador atual
	const columns = [
		{ header: "Curso", accessor: "curso" },
		{ header: "Data da Tentativa", accessor: "data" },
		{ header: "Nota", accessor: "nota" },
	];

	const data = [
		{ id: 1, cursoId: "x", curso: "Curso X", data: "21 de abril de 2025, 15h53", nota: "9/10" },
		{ id: 2, cursoId: "x", curso: "Curso X", data: "21 de abril de 2025, 15h33", nota: "7/10" },
		{ id: 3, cursoId: "y", curso: "Curso Y", data: "20 de abril de 2025, 14h13", nota: "8/10" },
		// Empty rows para manter o layout da tabela
		...Array.from({ length: 9 }).map((_, index) => ({ id: null, curso: "-", data: "-", nota: "-" })),
	];

	return (
		<div className="relative min-h-screen flex bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="max-w-6xl mx-auto">
				<TituloPrincipal>Minhas Avaliações</TituloPrincipal>

				{/* Framed table area */}
				<div className="mt-10 w-[65rem] h-[45rem] justify-center rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
					<Table
						columns={columns}
						data={data}
						headerClassName="bg-[#0067B1] text-white text-[1.125rem]"
						rowClassName="odd:bg-[#DAEEFF] even:bg-[#B5DEFF] hover:bg-[#bcdfff] transition-colors"
						onClickRow={(row) => {
							// Navegar para o gabarito da tentativa se for uma linha válida
							if (row.id && row.curso !== "-") {
								// Assumindo que cada row tem um idCurso associado
								const cursoId = row.cursoId || "x"; // fallback para "x"
								navigate(`/avaliacoes/${cursoId}/${row.id}`);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}