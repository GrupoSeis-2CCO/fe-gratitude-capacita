import React from "react";
import Table from "../components/Table";

export function UserClassesPage() {
  const columns = [
    { header: "Curso", accessor: "nomeCurso" },
    { header: "Progresso do Curso", accessor: "progressoCurso" },
    { header: "Iniciado", accessor: "iniciado" },
    { header: "Finalizado", accessor: "finalizado" }
  ];

  const data = [
    { nomeCurso: "Curso 1", progressoCurso: "50% Concluído", iniciado: "21 de abril de 2025", finalizado: "Incompleto" },
    { nomeCurso: "Curso 2", progressoCurso: "Concluído", iniciado: "03 de abril de 2025", finalizado: "Incompleto" },
    { nomeCurso: "Curso 3", progressoCurso: "5% Concluído", iniciado: "04 de abril de 2025", finalizado: "21 de abril de 2025" },
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
