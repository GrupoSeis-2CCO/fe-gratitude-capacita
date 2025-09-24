import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";

export function AccessPage() {
  const navigate = useNavigate();
  
  const columns = [
    { header: "Nome do Colaborador", accessor: "nome" },
    { header: "Materiais Concluídos", accessor: "materiais" },
    { header: "Avaliação", accessor: "avaliacao" },
    { header: "Último acesso", accessor: "ultimoAcesso" }
  ];

  const data = [
    { id: 1, nome: "Colaborador y", materiais: "5/5", avaliacao: "7 de 10", ultimoAcesso: "03 de abril de 2025, 12h15" },
    { id: 2, nome: "Colaborador x", materiais: "1/5", avaliacao: "Não feita", ultimoAcesso: "05 de abril de 2025, 14h32" },
    // Empty rows to match the visual spacing
    ...Array.from({ length: 10 }).map((_, index) => ({ 
      id: null, 
      nome: "-", 
      materiais: "-", 
      avaliacao: "-", 
      ultimoAcesso: "-" 
    })),
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Participantes do Curso x</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <div className="w-[65rem]">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
              {/* Search Input */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Procurar aluno xyz..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Course Filter Dropdown */}
              <div className="flex items-center gap-2">
                <select className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option>Curso x</option>
                  <option>Curso y</option>
                  <option>Curso z</option>
                </select>
              </div>
            </div>

            {/* Table Container with orange header */}
            <div className="rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
              <Table
                columns={columns}
                data={data}
                headerClassName="bg-[#FF6B35] text-white text-[1.125rem] font-bold"
                rowClassName="odd:bg-[#FFE8DA] even:bg-[#FFCDB2] hover:bg-[#ffb877] transition-colors"
                onClickRow={(row) => {
                  // Only navigate if the row has valid data
                  if (row.id && row.nome !== "-") {
                    // Navigate to user profile - using course x as default since this is access page
                    navigate(`/participante/${row.id}`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
