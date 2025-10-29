import React, { useEffect, useState, useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import AddMaterialSection from "../components/AddMaterialSection.jsx";
import MaterialCard from "../components/MaterialCard.jsx";
import AddEvaluationSection from "../components/AddEvaluationSection.jsx";
import { getMateriaisPorCurso } from "../services/MaterialListPageService.js";
import { updateVideo, updateApostila } from "../services/UploadService.js";

export default function MaterialsListPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
  const navigate = useNavigate();
  const { idCurso } = useParams();

	// Proteção: apenas funcionários (tipo 1) podem acessar esta página
	if (!isLoggedIn() || userType !== 1) {
		return <Navigate to="/login" replace />;
	}

	const [materials, setMaterials] = useState([]);
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [loading, setLoading] = useState(true);
	const [editingMaterial, setEditingMaterial] = useState(null);
	// (removed manual sorting UI — we rely on persisted order and reordering)
	// reordering (drag & drop)
	const [isReordering, setIsReordering] = useState(false);
	const [draggingIndex, setDraggingIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const [savingOrder, setSavingOrder] = useState(false);

	async function loadMaterials() {
		setLoading(true);
			try {
				const cursoId = Number(idCurso || 1); // prefer route param
				let matsResp;
				if (isReordering) {
					// reordering needs full list to avoid cross-page reorder confusion
					matsResp = await getMateriaisPorCurso(cursoId);
				} else {
					matsResp = await getMateriaisPorCurso(cursoId, { page, size });
				}
				const mats = Array.isArray(matsResp?.content) ? matsResp.content : (Array.isArray(matsResp) ? matsResp : []);
			// mapear para o formato do MaterialCard (id, title, type, description, url, hidden)
			const mapped = (mats || []).map((m, idx) => {
				const type = m.tipo === 'video' ? 'video' : (m.tipo === 'apostila' ? 'pdf' : 'avaliacao');
				// Strip trailing .pdf in titles for apostilas (cleaner list labels)
				const rawTitle = m.titulo ?? m.nomeApostila ?? m.nomeVideo ?? `Material ${m.id ?? idx}`;
				const cleanTitle = typeof rawTitle === 'string' && /\.pdf$/i.test(rawTitle) ? rawTitle.replace(/\.pdf$/i, '') : rawTitle;
				return ({
					id: m.id ?? m.idApostila ?? m.idVideo ?? idx,
					title: type === 'pdf' ? cleanTitle : rawTitle,
					type,
					description: m.descricao ?? m.descricaoApostila ?? m.descricaoVideo ?? '',
					url: m.url ?? m.urlArquivo ?? m.urlVideo ?? null,
					hidden: (typeof m.isApostilaOculto !== 'undefined') ? (m.isApostilaOculto === 1) : (typeof m.isVideoOculto !== 'undefined' ? (m.isVideoOculto === 1) : false),
					// Persisted order when available; this drives stable numbering even when filtering
					order: m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? (idx + 1)
				});
			});

			// Ordenar por order e, em empate, vídeo antes de pdf (igual ao StudentMaterialsListPage)
			mapped.sort((a, b) => {
				const oa = Number(a.order || 0), ob = Number(b.order || 0);
				if (oa !== ob) return oa - ob;
				const weight = (t) => (t === 'video' ? 0 : (t === 'pdf' ? 1 : 2));
				return weight(a.type) - weight(b.type);
			});

						// Atribuir displayOrder sequencial a todos os itens (incluindo avaliações)
						// assim as avaliações também recebem um número na listagem.
						let counter = 0;
						const withDisplay = mapped.map((m) => {
							counter += 1;
							return { ...m, displayOrder: counter };
						});
			setMaterials(withDisplay);
			// pagination metadata
			const total = Number(matsResp?.totalElements || withDisplay.length);
			const totalP = Number(matsResp?.totalPages || Math.ceil(total / size));
			setTotalElements(total);
			setTotalPages(totalP);
			} catch (err) {
				console.error('Erro salvando nova ordem:', err);
				window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Falha ao salvar ordem', message: String(err?.response?.data || err?.message || err) } }));
		} finally {
			setLoading(false);
		}
	}

		useEffect(() => { loadMaterials(); }, [idCurso, page, size, isReordering]);

	// When in reordering mode we render and operate directly on `materials` (which are ordered by their saved order)
	const listToRender = materials;

	function handleDragStart(e, index) {
		e.dataTransfer.effectAllowed = 'move';
		try { e.dataTransfer.setData('text/plain', String(index)); } catch (err) { /* noop in some browsers */ }
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

		// reorder in-memory
		const copy = [...materials];
		const [moved] = copy.splice(from, 1);
		copy.splice(to, 0, moved);
		// update order indices
		for (let i = 0; i < copy.length; i++) {
			copy[i].order = i + 1;
		}
		setMaterials(copy);
		setDraggingIndex(null);
		setDragOverIndex(null);

		// persist new order to backend
		setSavingOrder(true);
		try {
			for (let i = 0; i < copy.length; i++) {
				const mat = copy[i];
				const ordem = i + 1;
				if (mat.type === 'video') {
					await updateVideo(mat.id, { nomeVideo: mat.title, descricaoVideo: mat.description || null, urlVideo: mat.url || null, ordemVideo: ordem });
				} else if (mat.type === 'pdf') {
					await updateApostila(mat.id, { nomeApostila: mat.title, descricaoApostila: mat.description || null, ordem: ordem });
				} else {
					// skip other types (avaliacao) or implement later
				}
			}
			// reload to ensure server truth
			await loadMaterials();
		} catch (err) {
			console.error('Erro salvando nova ordem:', err);
			alert('Erro ao salvar nova ordem: ' + (err?.response?.data || err?.message || err));
		} finally {
			setSavingOrder(false);
		}
	}

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<div>
							<Button variant="Ghost" label="← Voltar" onClick={() => navigate(`/cursos/${idCurso}`)} />
						</div>
						<div className="text-center">
							<TituloPrincipal>Materiais do Curso de Regularização Fundiária</TituloPrincipal>
						</div>
						<div className="w-24" />
					</div>
				</div>

				<AddMaterialSection initialMaterial={editingMaterial} onAdded={() => { setEditingMaterial(null); loadMaterials(); }} onCancelEdit={() => setEditingMaterial(null)} />

				<div className="mt-8 w-full">
					{/* Reordering is handled below (persisted order) */}

					{/* Reorder toggle / instructions */}
					<div className="flex items-center justify-between mb-4">
						<div>
							<button className={`px-3 py-1 text-sm border rounded ${isReordering ? 'bg-yellow-100' : 'bg-white'}`} onClick={() => setIsReordering(r => !r)}>
								{isReordering ? 'Sair de reordenação' : 'Reordenar materiais'}
							</button>
							{isReordering && <span className="ml-3 text-sm text-gray-600">Arraste e solte os materiais na posição desejada. Solte para salvar.</span>}
						</div>
						<div>
							{savingOrder && <span className="text-sm text-gray-600">Salvando ordem...</span>}
						</div>
					</div>

					{loading ? (
						<div>Carregando...</div>
					) : (
							<>
							{listToRender.map((material, index) => {
								const key = `${material.type}-${material.id}`;
								if (!isReordering) {
									return (
										<MaterialCard
											key={key}
											material={material}
											index={index}
											onEdit={(m) => setEditingMaterial(m)}
											onActionComplete={() => loadMaterials()}
											onClick={() => {
												// Avaliação deve abrir a rota de avaliação (ExamRoutePage) para admin
												if (material.type === 'avaliacao') {
													// Passa o id da avaliação para a rota
													return navigate(`/cursos/${idCurso}/material/avaliacao/${material.id}`);
												}
												// Materiais devem navegar com prefixo de tipo para garantir o alvo correto
												const tipo = material.type === 'pdf' ? 'pdf' : 'video';
												return navigate(`/cursos/${idCurso}/material/${tipo}-${material.id}`);
											}}
										/>
									);
								}

								// draggable wrapper
																return (
									<div key={key}
										draggable
										onDragStart={(e) => handleDragStart(e, index)}
										onDragOver={(e) => handleDragOver(e, index)}
										onDrop={(e) => handleDrop(e, index)}
										onDragEnd={handleDragEnd}
										className={`cursor-move ${dragOverIndex === index ? 'bg-yellow-50' : ''}`}>
										<MaterialCard material={material} index={index} onEdit={(m) => setEditingMaterial(m)} onActionComplete={() => loadMaterials()} />
									</div>
								);
														})}
														{!isReordering && (
															<div className="flex items-center justify-between mt-4">
																<div className="text-sm text-gray-600">Página {page + 1}{totalPages ? ` de ${totalPages}` : ''} • {totalElements} itens</div>
																<div className="flex items-center gap-2">
																	<button className={`px-3 py-1 border rounded ${page>0 ? 'text-gray-800' : 'text-gray-400 cursor-not-allowed'}`} disabled={page<=0} onClick={() => setPage(p => Math.max(0, p-1))}>Anterior</button>
																	<select className="px-2 py-1 border rounded" value={size} onChange={(e)=>{ setPage(0); setSize(Number(e.target.value)); }}>
																		{[5,10,20,50].map(s => <option key={s} value={s}>{s}/página</option>)}
																	</select>
																	<button className={`px-3 py-1 border rounded ${ (totalPages ? (page+1)<totalPages : (listToRender.length===size)) ? 'text-gray-800' : 'text-gray-400 cursor-not-allowed'}`} disabled={ totalPages ? (page+1)>=totalPages : (listToRender.length<size)} onClick={() => setPage(p => p+1)}>Próxima</button>
																</div>
															</div>
														)}
														</>
					)}
				</div>

        		<AddEvaluationSection />
			</div>

		</div>
	);
}
