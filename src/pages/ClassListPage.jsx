import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddCourseSection from "../components/AddCourseSection.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses, deleteCourse, toggleCourseHidden } from "../services/ClassListPageService.js";
// Removido fetch detalhado por curso (materiais) para evitar N chamadas adicionais na página /cursos
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

    // Prefer explicit material list from the course payload when available so we can count
    // only non-evaluation materials (videos/pdf) and keep the counts consistent with
    // the MaterialsListPage which may exclude or treat evaluations specially.
    const materialsRaw = course.stats?.materials ?? course.totalMateriais ?? course.materials ?? course.qtdMateriais;
    // If `course.materials` is an array, compute a robust count of non-evaluation materials
    let computedMaterialsCount = null;
    if (Array.isArray(course.materials)) {
      try {
        computedMaterialsCount = course.materials.filter((m) => {
          const tipoRaw = String(m.tipo || m.type || '').toLowerCase();
          // treat anything including 'avaliacao' as evaluation
          if (tipoRaw.includes('avaliacao')) return false;
          // otherwise count as material (video/pdf). If type missing, try to infer from url/title
          if (tipoRaw) return true;
          const maybeUrl = String(m.url || m.urlVideo || m.urlArquivo || '').toLowerCase();
          if (maybeUrl.includes('video') || maybeUrl.endsWith('.mp4') || maybeUrl.includes('youtu')) return true;
          const maybeTitle = String(m.titulo || m.title || m.nomeApostila || '').toLowerCase();
          if (maybeTitle.includes('avaliacao') || maybeTitle.includes('prova')) return false;
          return true;
        }).length;
      } catch (e) {
        computedMaterialsCount = null;
      }
    }
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
        materials: computedMaterialsCount != null ? computedMaterialsCount : toNumberOrZero(materialsRaw),
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

  // Filtering / sorting UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('recent'); // 'recent' | 'oldest' | 'alpha'

  // debounce searchTerm to avoid expensive recalculations while typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch((searchTerm || '').trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // client-side filtered + sorted view derived from `courses`
  const filteredCourses = useMemo(() => {
    const s = debouncedSearch || '';
    const arr = (courses || []).filter((c) => {
      if (!s) return true;
      const title = String(c.title || c.tituloCurso || '').toLowerCase();
      const desc = String(c.description || c.descricao || '').toLowerCase();
      return title.includes(s) || desc.includes(s);
    });

    // apply sorting
    const copy = [...arr];
    if (sortOption === 'recent') {
      copy.sort((a, b) => {
        const da = new Date(a.createdAt || a.criadoEm || 0).getTime() || 0;
        const db = new Date(b.createdAt || b.criadoEm || 0).getTime() || 0;
        return db - da; // most recent first
      });
    } else if (sortOption === 'oldest') {
      copy.sort((a, b) => {
        const da = new Date(a.createdAt || a.criadoEm || 0).getTime() || 0;
        const db = new Date(b.createdAt || b.criadoEm || 0).getTime() || 0;
        return da - db; // oldest first
      });
    } else if (sortOption === 'alpha') {
      copy.sort((a, b) => String(a.title || a.tituloCurso || '').localeCompare(String(b.title || b.tituloCurso || '')));
    }
    return copy;
  }, [courses, debouncedSearch, sortOption]);

  const userType = getCurrentUserType?.();
  const logged = isLoggedIn?.();

  const handleRefresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      if (!isMountedRef.current) return;
      const normalized = normalizeCourses(data);
      setCourses(normalized);

      // OBS: Consulta de materiais por curso desativada para reduzir requisições na listagem.
      // Caso seja necessário reativar no futuro, considerar um toggle ou pré-carregar em outra tela.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - handleRefresh is stable with useCallback

  if (logged === false || (typeof userType === "number" && userType !== 1)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="text-center mb-4">
          <TituloPrincipal>Cursos de Capacitação</TituloPrincipal>
        </div>

        {/* Search + Sort toolbar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="flex-1 border rounded px-3 py-2 text-sm shadow-sm"
            />

            <div className="flex items-center gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded px-2 py-2 text-sm bg-white"
              >
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
                <option value="alpha">Ordem Alfabética</option>
              </select>

              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 bg-gray-100 rounded text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
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
            filteredCourses.map((course) => (
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
