import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddCourseSection from "../components/AddCourseSection.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses, deleteCourse, toggleCourseHidden } from "../services/ClassListPageService.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
// (duplicate import removed)

function normalizeCourses(data) {
  if (!Array.isArray(data)) return [];

  return data.map((course) => {
    const id = course.idCurso ?? course.id ?? course.codigo;
    const titulo = course.tituloCurso || course.title || course.nome || `Curso ${id ?? ""}`;
    const descricao = course.descricao || course.description || course.descricaoCurso || "";
    const imagem = course.imagem || course.imageUrl || course.bannerUrl || null;
    const duration = course.duracaoEstimada;
    const normalizedDuration =
      typeof duration === "number" && Number.isFinite(duration)
        ? `${duration}h`
        : course.stats?.hours || course.hours || course.totalHoras || "00:00h";

    const materialsRaw = course.stats?.materials ?? course.totalMateriais ?? course.materials ?? course.qtdMateriais;
    const studentsRaw = course.stats?.students ?? course.totalAlunos ?? course.students ?? course.qtdAlunos;

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

export default function ClassListPage() {
  const { getCurrentUserType, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, course: null });

  const userType = getCurrentUserType?.();
  const logged = isLoggedIn?.();

  const handleRefresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      if (!isMountedRef.current) return;
      setCourses(normalizeCourses(data));
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Erro ao carregar cursos:", err);
      setError(err?.message || "Erro ao carregar os cursos.");
      setCourses([]);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback((selected) => {
    if (!selected) return;
    setConfirmDelete({ open: true, course: selected });
  }, []);

  const confirmDeleteAction = useCallback(async () => {
    const selected = confirmDelete.course;
    const id = selected?.id ?? selected?.idCurso;
    if (!id) {
      setConfirmDelete({ open: false, course: null });
      return;
    }
    try {
      await deleteCourse(id);
      setConfirmDelete({ open: false, course: null });
      await handleRefresh();
    } catch (err) {
      console.error("Erro ao excluir curso:", err);
      const msg = err?.message || 'Erro ao excluir o curso.';
      setError(typeof msg === 'string' ? msg : 'Erro ao excluir o curso.');
      setConfirmDelete({ open: false, course: null });
    }
  }, [confirmDelete, handleRefresh]);

  const handleToggleHidden = useCallback(async (selected) => {
    if (!selected) return;
    const id = selected.id ?? selected.idCurso;
    if (!id) return;
    try {
      await toggleCourseHidden(id);
      await handleRefresh();
    } catch (err) {
      console.error("Erro ao atualizar visibilidade:", err);
      setError(err?.response?.data || err?.message || "Erro ao atualizar visibilidade do curso.");
    }
  }, [handleRefresh]);

  useEffect(() => {
    isMountedRef.current = true;
    handleRefresh();

    return () => {
      isMountedRef.current = false;
    };
  }, [handleRefresh]);

  if (logged === false || (typeof userType === "number" && userType !== 1)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-10">
          <TituloPrincipal>Cursos de Capacitação</TituloPrincipal>
        </div>
  <AddCourseSection onCourseCreated={async () => { setEditingCourse(null); await handleRefresh(); }} editCourse={editingCourse} />

        <div className="mt-8 w-full">
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-600">Nenhum curso cadastrado ainda.</div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id ?? course.idCurso}
                course={course}
                onClick={(selected) =>
                  navigate(`/cursos/${selected?.id ?? selected?.idCurso ?? course.id ?? course.idCurso}`)
                }
                onEdit={(selected) => {
                  // usa o AddCourseSection em modo edição com preenchimento atual
                  setEditingCourse(selected);
                }}
                onDelete={handleDelete}
                onToggleHidden={handleToggleHidden}
              />
            ))
          )}
        </div>
        <ConfirmModal
          open={confirmDelete.open}
          title="Excluir curso"
          message={(() => {
            if (!confirmDelete.course) return '';
            const name = confirmDelete.course.title || confirmDelete.course.tituloCurso;
            const m = Number(confirmDelete.course.stats?.materials || 0);
            const s = Number(confirmDelete.course.stats?.students || 0);
            const lines = [
              `Você está prestes a excluir o curso: "${name}".`,
              'Esta ação é permanente.',
            ];
            if (m > 0 || s > 0) {
              lines.push('', 'Vínculos identificados:');
              lines.push(`• Materiais vinculados: ${String(m)}`);
              lines.push(`• Alunos vinculados: ${String(s)}`);
              lines.push('', 'Ao confirmar, todos os vínculos serão removidos junto com o curso.');
            }
            lines.push('', 'Deseja continuar?');
            return lines.join('\n');
          })()}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete({ open: false, course: null })}
        />
      </div>
    </div>
  );
}
