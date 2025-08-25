import React from "react";
import Table from "../components/Table";

export function UserClassesPage() {
  const columns = [
    { header: "Curso", accessor: "nomeCurso" },
    { header: "Progresso do Curso", accessor: "progressoCurso" },
    { header: "Iniciado", accessor: "iniciado" },
    { header: "Finalizado", accessor: "finalizado" },
  ];

  const data = [
    { nomeCurso: "Curso 1", progressoCurso: "50% Concluído", iniciado: "21 de abril de 2025", finalizado: "Incompleto" },
    { nomeCurso: "Curso 2", progressoCurso: "Concluído", iniciado: "03 de abril de 2025", finalizado: "Incompleto" },
    { nomeCurso: "Curso 3", progressoCurso: "5% Concluído", iniciado: "04 de abril de 2025", finalizado: "21 de abril de 2025" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-[200px] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Cursos do Participante</h1>
        <Table
          columns={columns}
          data={data}
          headerClassName="bg-[#0067B1] text-white"
          rowClassName="odd:bg-[#DAEEFF] even:bg-[#B5DEFF] hover:bg-[#99ccff] transition-colors"
        />
      </div>
    </div>
  );
}
