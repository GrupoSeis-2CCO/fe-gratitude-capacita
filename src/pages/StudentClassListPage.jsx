import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses } from "../services/ClassListPageService.js";

function normalizeCourses(data) {
  if (!Array.isArray(data)) return [];

  return data.map((course) => {
    const id = course.idCurso ?? course.id ?? course.codigo ?? course.codigoCurso ?? null;
    const titulo = course.tituloCurso || course.title || course.nome || course.nomeCurso || `Curso ${id ?? ""}`;
    const descricao = course.descricao || course.description || course.descricaoCurso || "";
    const imagem = course.imagem || course.imageUrl || course.bannerUrl || null;
    const duration = course.duracaoEstimada ?? course.hours ?? course.totalHoras ?? null;
    const normalizedDuration = typeof duration === "number" ? `${duration}h` : (duration || "00:00h");

    const materialsRaw = course.totalMateriais ?? course.materials ?? course.qtdMateriais ?? course.stats?.materials;
    const studentsRaw = course.totalAlunos ?? course.students ?? course.qtdAlunos ?? course.stats?.students;

    const toNumberOrZero = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    return {
      ...course,
      id,
      title: titulo,
      description: descricao,
      imageUrl: imagem,
      stats: {
        materials: toNumberOrZero(materialsRaw),
        students: toNumberOrZero(studentsRaw),
        hours: normalizedDuration,
      },
    };
  });
}

export default function StudentClassListPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const userType = getCurrentUserType?.();
  const navigate = useNavigate();

  // Proteção: apenas colaboradores (tipo 2) podem acessar esta página
  if (isLoggedIn?.() === false || userType !== 2) {
    return <Navigate to="/login" replace />;
  }

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  

  useEffect(() => {
    isMountedRef.current = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCourses();
        if (!isMountedRef.current) return;
        // Filtra cursos ocultos para colaboradores
        const filtered = Array.isArray(data)
          ? data.filter((c) => !c.ocultado)
          : [];
        setCourses(normalizeCourses(filtered));
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error("Erro ao carregar cursos:", err);
        setError(err?.message || "Erro ao carregar cursos");
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    }
    load();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-10">
          <TituloPrincipal>Participantes / Cursos</TituloPrincipal>
        </div>

        {/* removed ordering UI per request */}

        <div className="mt-8 w-full space-y-4">
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-600">Nenhum curso disponível.</div>
          ) : (
            courses.map((course) => (
              <div key={course.id ?? course.idCurso} className="relative">
                <CourseCard
                  course={course}
                  onClick={() => navigate(`/cursos/${course.id ?? course.idCurso}/material`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
