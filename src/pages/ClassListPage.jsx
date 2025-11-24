import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import AddCourseSection from "../components/AddCourseSection.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses, deleteCourse, toggleCourseHidden, reorderCourses } from "../services/ClassListPageService.js";
import { getMateriaisPorCurso } from "../services/MaterialListPageService.js";
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
  // Reordenação (drag & drop)
  const [isReordering, setIsReordering] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Filtering / sorting UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState(''); // '' = none selected; 'recent' | 'oldest' | 'alpha'

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

    // apply sorting only when an option is selected
    const copy = [...arr];

    const getTimestamp = (item) => {
      if (!item) return 0;
      const candidates = [
        item.createdAt,
        item.criadoEm,
        item.dataCriacao,
        item.data_criacao,
        item.created_at,
        item.criado_em,
        item.dataCadastro,
        item.data_cadastro,
        item.created,
        item.updatedAt,
        item.updated_at,
      ];
      for (const c of candidates) {
        if (!c && c !== 0) continue;
        const d = new Date(c);
        if (!Number.isNaN(d.getTime())) return d.getTime();
      }
      // fallback: if item has id-like fields, use them as proxy for recency
      const maybeId = item.id ?? item.idCurso ?? item.codigo ?? item.codigoCurso ?? item.courseId;
      if (maybeId != null && !Number.isNaN(Number(maybeId))) return Number(maybeId);
      return 0;
    };

    if (sortOption === 'recent') {
      copy.sort((a, b) => {
        const da = getTimestamp(a);
        const db = getTimestamp(b);
        return db - da; // most recent first
      });
    } else if (sortOption === 'oldest') {
      copy.sort((a, b) => {
        const da = getTimestamp(a);
        const db = getTimestamp(b);
        return da - db; // oldest first
      });
    } else if (sortOption === 'alpha') {
      copy.sort((a, b) => String(a.title || a.tituloCurso || '').localeCompare(String(b.title || b.tituloCurso || '')));
    }

    return copy;
  }, [courses, debouncedSearch, sortOption]);

  // Lista utilizada para renderizar quando em modo de reordenação (ignora filtros/sort para estabilidade)
  const listToRender = isReordering ? courses.slice().sort((a,b) => (Number(a.order||a.ordemCurso||0) - Number(b.order||b.ordemCurso||0))) : filteredCourses;

  const userType = getCurrentUserType?.();
  const logged = isLoggedIn?.();

  const handleRefresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      if (!isMountedRef.current) return;
      const normalized = normalizeCourses(data).map((c, idx) => ({
        ...c,
        order: c.ordemCurso || c.order || (idx + 1)
      }));
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

  // Após carregar cursos, reforça contagem de materiais contando apenas vídeos/apostilas não ocultos (exclui avaliações).
  useEffect(() => {
    async function augmentMaterialCounts() {
      if (!Array.isArray(courses) || courses.length === 0) return;
      // Evita loop infinito: só processa cursos que ainda não foram ajustados.
      const needsAugment = courses.some(c => !c.__realMaterials);
      if (!needsAugment) return;
      try {
        const updated = await Promise.all(courses.map(async (c) => {
          if (c.__realMaterials) return c; // já ajustado
          const cid = c.id ?? c.idCurso;
          if (!cid) return { ...c, __realMaterials: true };
          try {
            const raw = await getMateriaisPorCurso(cid); // lista completa ou objeto paginado
            const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : []);
            // Mapear igual MaterialsListPage
            const mapped = arr.map((m, idx) => {
              const tipo = m.tipo === 'video' ? 'video' : (m.tipo === 'apostila' ? 'pdf' : 'avaliacao');
              const hiddenFlag = (typeof m.isApostilaOculto !== 'undefined') ? (Number(m.isApostilaOculto) === 1) : (typeof m.isVideoOculto !== 'undefined' ? (Number(m.isVideoOculto) === 1) : false);
              return { tipo, hidden: hiddenFlag };
            });
            const count = mapped.filter(m => !m.hidden && (m.tipo === 'video' || m.tipo === 'pdf')).length;
            return {
              ...c,
              stats: { ...(c.stats || {}), materials: count },
              __realMaterials: true,
            };
          } catch (e) {
            // Se falhar, marca como ajustado para não tentar em loop
            return { ...c, __realMaterials: true };
          }
        }));
        setCourses(updated.map((c,i)=>({ ...c, order: c.order || c.ordemCurso || (i+1) })));
      } catch (_) {
        // silencioso
      }
    }
    augmentMaterialCounts();
  }, [courses]);

  // Drag & drop handlers
  function handleDragStart(e, index) {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(index)); } catch (_) {}
    setDraggingIndex(index);
  }
  function handleDragOver(e, index) {
    e.preventDefault();
    setDragOverIndex(index);
  }
  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }
  async function handleDrop(e, index) {
    e.preventDefault();
    const fromData = e.dataTransfer.getData('text/plain');
    const from = fromData ? parseInt(fromData, 10) : draggingIndex;
    if (from == null || Number.isNaN(from)) return handleDragEnd();
    const to = index;
    if (from === to) return handleDragEnd();

    const base = courses.slice().sort((a,b) => (Number(a.order||a.ordemCurso||0) - Number(b.order||b.ordemCurso||0)));
    const copy = [...base];
    const [moved] = copy.splice(from,1);
    copy.splice(to,0,moved);
    copy.forEach((c,i)=>{ c.order = i+1; c.ordemCurso = c.order; });
    setCourses(copy);
    setDraggingIndex(null);
    setDragOverIndex(null);
    // Persistência adiada para quando sair do modo de reordenação
  }

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
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center text-black">Cursos de Capacitação</h1>
        </div>

        {/* Search + Sort toolbar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="flex-1 border rounded px-3 py-2 text-sm shadow-sm bg-white"
            />

            <div className="flex items-center gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded px-3 py-2 text-sm shadow-sm bg-white cursor-pointer"
              >
                <option value="" disabled>Selecione</option>
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
                <option value="alpha">Ordem Alfabética</option>
              </select>

              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 rounded text-sm border shadow-sm bg-white cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <AddCourseSection onCourseCreated={async () => { setEditingCourse(null); await handleRefresh(); }} editCourse={editingCourse} />

        <div className="mt-8 w-full">
          {/* Toggle reordenação */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                className={`px-4 py-2 text-base font-medium rounded transition-colors duration-150 ${isReordering ? 'bg-orange-100 border border-orange-400 text-orange-900 shadow-md' : 'bg-orange-500 text-white shadow-md hover:bg-orange-600'} cursor-pointer`}
                onClick={async () => {
                  if (isReordering) {
                    // Ao sair, persiste ordem atual
                    try {
                      setSavingOrder(true);
                      const ordered = courses.slice().sort((a,b)=>Number((a.order||a.ordemCurso||0)) - Number((b.order||b.ordemCurso||0)));
                      await reorderCourses(ordered.map(c => ({ idCurso: c.idCurso || c.id, ordemCurso: c.order || c.ordemCurso })));
                      await handleRefresh();
                      // Toast de sucesso semelhante ao de materiais
                      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', title: 'Ordem salva', message: 'Nova ordem de cursos persistida.' } }));
                    } catch (err) {
                      console.error('Erro ao persistir ordem de cursos:', err);
                      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Falha ao salvar ordem', message: String(err?.message || err) } }));
                    } finally {
                      setSavingOrder(false);
                      setIsReordering(false);
                    }
                  } else {
                    setIsReordering(true);
                  }
                }}
              >
                {isReordering ? 'Salvar ordem e sair' : 'Reordenar cursos'}
              </button>
              {isReordering && <span className="ml-3 text-sm text-gray-600">Arraste e solte para definir a nova ordem.</span>}
            </div>
            <div>{savingOrder && <span className="text-sm text-gray-600">Salvando ordem...</span>}</div>
          </div>
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-600">Nenhum curso cadastrado ainda.</div>
          ) : (
            listToRender.map((course, idx) => {
              const card = (
                <CourseCard
                  key={course.id ?? course.idCurso}
                  index={idx}
                  course={course}
                  onClick={(selected) =>
                    navigate(`/cursos/${selected?.id ?? selected?.idCurso ?? course.id ?? course.idCurso}`)
                  }
                  onEdit={(selected) => { setEditingCourse(selected); }}
                  onDelete={handleDelete}
                  onToggleHidden={handleToggleHidden}
                />
              );
              if (!isReordering) return card;
              return (
                <div
                  key={`drag-${course.id ?? course.idCurso}`}
                  draggable
                  onDragStart={(e)=>handleDragStart(e, idx)}
                  onDragOver={(e)=>handleDragOver(e, idx)}
                  onDrop={(e)=>handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move ${dragOverIndex===idx ? 'bg-yellow-50' : ''}`}
                >
                  {card}
                </div>
              );
            })
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
