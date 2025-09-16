import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Table from "../components/Table";
import GradientSideRail from "../components/GradientSideRail.jsx";

export function ClassUsersPage() {
  const navigate = useNavigate();

  const idCurso = 1;

  const columns = [
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Materiais Concluídos", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" }
  ];

  const data = [
    { id:1, nome: "Nícolas", materiais: "2/5", avaliacao: "7 de 10", ultimoAcesso: "03 de abril de 2025, 12h15" },
    { id:2, nome: "Ana", materiais: "3/5", avaliacao: "5 de 10", ultimoAcesso: "28 de setembro de 2023, 10h00" },
    { id:3, nome: "Carlos", materiais: "4/5", avaliacao: "Não Feita", ultimoAcesso: "03 de outubro de 2023, 14h30" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 p-8">
      <GradientSideRail className="left-10" />
      <GradientSideRail variant="inverted" className="right-10" />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Participantes do Curso</h1>
        <Table onClickRow={(row) => navigate(`/cursos/${idCurso}/participante/${row.id}`)} columns={columns} data={data} />
      </div>
    </div>
  );
}
