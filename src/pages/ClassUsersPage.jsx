import React from "react";
import Table from "../components/Table";

export function ClassUsersPage() {
  const columns = [
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Materiais Concluídos", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" }
  ];

  const data = [
    { nome: "Nícolas", materiais: "2/5", avaliacao: "7 de 10", ultimoAcesso: "03 de abril de 2025, 12h15" },
    { nome: "Ana", materiais: "3/5", avaliacao: "5 de 10", ultimoAcesso: "28 de setembro de 2023, 10h00" },
    { nome: "Carlos", materiais: "4/5", avaliacao: "Não Feita", ultimoAcesso: "03 de outubro de 2023, 14h30" },
  ];

  return (
    <div className="fundo">
      <div className="class-users-container">
        <h1 className="class-users-title">Participantes do Curso</h1>
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
}
