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

    // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
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
            // Ordenar do mais recente para o mais antigo se houver campo dt
            setRows(data);
        } catch (e) {
            if (!mounted) return;
            setError(e?.message || "Erro ao carregar avaliações");
        } finally {
            if (mounted) setLoading(false);
        }
        }
        load();
        return () => { mounted = false };
    }, [idUsuario]);

    const columns = [
        { header: "Curso", accessor: "curso" },
        { header: "Data da Tentativa", accessor: "data" },
        { header: "Nota", accessor: "nota" },
    ];

    // Simple table inline to avoid missing Table component
    function SimpleTable({ columns, data, onClickRow }) {
        return (
        <table className="min-w-full">
            <thead>
            <tr className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
                {columns.map((col) => (
                <th key={col.accessor} className="py-5 px-6 text-left font-bold text-lg tracking-wide">{col.header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.length === 0 ? (
                <tr><td colSpan={columns.length} className="p-6 text-center text-gray-600">Nenhuma prova encontrada.</td></tr>
            ) : data.map((row, idx) => (
                <tr key={`r-${row.cursoId ?? 'x'}-${row.id ?? idx}`} className={`${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 cursor-pointer`} onClick={() => {
                if (row?.id) {
                    const cursoId = row.cursoId ?? 'x';
                    navigate(`/avaliacoes/${cursoId}/${row.id}`);
                }
                }}>
                {columns.map((col) => (
                    <td key={`${col.accessor}-${idx}`} className="py-5 px-6">{row[col.accessor]}</td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        );
    }

    return (
        <div className="relative min-h-screen flex bg-white px-8 pt-30 pb-20">
        {/* Decorative rails left and right */}
        <GradientSideRail className="left-10" />
        <GradientSideRail className="right-10" variant="inverted" />

        <div className="max-w-6xl mx-auto w-full">
            <TituloPrincipal>Minhas Avaliações</TituloPrincipal>

            <div className="mt-10 w-[65rem] min-h-[20rem] justify-center rounded-lg border-[0.1875rem] border-[#1D262D] bg-[#0F1418] p-4 shadow-[0_0_0_0.1875rem_#1D262D]">
            {loading && <div className="p-6 text-center text-white">Carregando...</div>}
            {error && <div className="p-6 text-center text-red-200">{error}</div>}
            {!loading && !error && (
                <div className="bg-white rounded overflow-hidden">
                <SimpleTable columns={columns} data={rows} />
                </div>
            )}
            </div>
        </div>
        </div>
    );
    }
