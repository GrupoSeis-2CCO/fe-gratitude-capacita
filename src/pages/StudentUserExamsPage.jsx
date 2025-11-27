import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import TituloPrincipal from "../components/TituloPrincipal";
import GradientSideRail from "../components/GradientSideRail.jsx";
import { getTentativasTableData } from "../services/StudantUserExamsPageService.js";

export default function StudentUserExamsPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType();
  const navigate = useNavigate();
  const params = useParams();
  const idUsuario = useMemo(() => params.id ?? params.idUsuario ?? params.idAluno, [params]);

  if (!isLoggedIn() || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTentativasTableData(Number(idUsuario));
        if (!mounted) return;
        setRows(data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Erro ao carregar avaliacoes");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [idUsuario]);

  const columns = [
    { header: "Curso", accessor: "curso" },
    { header: "Data da Tentativa", accessor: "data" },
    { header: "Nota", accessor: "nota" },
  ];

  function SimpleTable({ columns, data, onClickRow }) {
    return (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
            {columns.map((col) => (
              <th key={col.accessor} className="py-4 px-4 text-left font-bold tracking-wide">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="p-4 text-center text-gray-600">Nenhuma prova encontrada.</td></tr>
          ) : data.map((row, idx) => (
            <tr
              key={`r-${row.cursoId ?? 'x'}-${row.id ?? idx}`}
              className={`${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 cursor-pointer`}
              onClick={() => { if (row?.id) navigate(`/avaliacoes/${row.cursoId ?? 'x'}/${row.id}`); }}
            >
              {columns.map((col) => (
                <td key={`${col.accessor}-${idx}`} className="py-4 px-4 align-middle">{row[col.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function CardList({ data }) {
    if (!data.length) return <div className="text-gray-600">Nenhuma prova encontrada.</div>;
    return (
      <div className="space-y-3 md:hidden">
        {data.map((row, idx) => (
          <button
            key={`c-${row.cursoId ?? 'x'}-${row.id ?? idx}`}
            className="w-full text-left bg-white border border-blue-100 rounded-lg shadow-sm p-4 cursor-pointer"
            onClick={() => { if (row?.id) navigate(`/avaliacoes/${row.cursoId ?? 'x'}/${row.id}`); }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-blue-900">{row.curso}</div>
              <div className="text-xs text-gray-500">{row.data}</div>
            </div>
            <div className="text-sm text-gray-700">Nota: {row.nota}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex bg-[#F2F2F2] px-4 sm:px-6 lg:px-8 pt-13 md:pt-13 pb-16">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-6">
          <TituloPrincipal>Minhas Avaliacoes</TituloPrincipal>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Minhas avaliacoes registradas</p>
          </div>
          {loading && <div className="p-4 text-center text-gray-600">Carregando...</div>}
          {error && <div className="p-4 text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              <CardList data={rows} />
              <div className="hidden md:block overflow-x-auto rounded border border-blue-100">
                <SimpleTable columns={columns} data={rows} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

