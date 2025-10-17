import React, { useEffect, useState, useMemo } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
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
	const { idCurso } = useParams();
	const navigate = useNavigate();
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();

	// Proteção: apenas funcionários (tipo 1) podem acessar esta página
	if (!isLoggedIn() || userType !== 1) {
		return <Navigate to="/login" replace />;
	}

	const [materials, setMaterials] = useState([]);
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
				const cursoId = Number(idCurso) || 1;
				const mats = await getMateriaisPorCurso(cursoId);
			// mapear para o formato do MaterialCard (id, title, type, description, url, hidden)
			const mapped = (mats || []).map((m, idx) => ({
				id: m.id ?? m.idApostila ?? m.idVideo ?? idx,
				title: m.titulo ?? m.nomeApostila ?? m.nomeVideo ?? `Material ${m.id ?? idx}`,
				type: m.tipo === 'video' ? 'video' : (m.tipo === 'apostila' ? 'pdf' : 'avaliacao'),
				description: m.descricao ?? m.descricaoApostila ?? m.descricaoVideo ?? '',
				url: m.url ?? m.urlArquivo ?? m.urlVideo ?? null,
				hidden: (typeof m.isApostilaOculto !== 'undefined') ? (m.isApostilaOculto === 1) : (typeof m.isVideoOculto !== 'undefined' ? (m.isVideoOculto === 1) : false),
				order: m.ordem ?? m.ordemVideo ?? m.ordemApostila ?? idx
			}));

			// ensure base materials are sorted by stored order initially
			mapped.sort((a, b) => (a.order || 0) - (b.order || 0));
			setMaterials(mapped);
		} catch (e) {
			console.error('Erro carregando materiais:', e);
			setMaterials([]);
		} finally {
			setLoading(false);
		}
	}

	// Listen for material finalization events (dispatched by MaterialPage) and reload list
	useEffect(() => {
		let mounted = true;
		async function refetchOnEvent(e) {
			const { idCurso: courseId } = e.detail || {};
			if (String(courseId) !== String(idCurso)) return;
			// small debounce to avoid rapid repeated reloads
			setTimeout(() => { if (!mounted) return; loadMaterials(); }, 150);
		}
		window.addEventListener('material:finalizado', refetchOnEvent);
		return () => { mounted = false; window.removeEventListener('material:finalizado', refetchOnEvent); };
	}, [idCurso]);

	useEffect(() => { loadMaterials(); }, []);

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
				<div className="mb-10 flex items-center justify-between">
					<div>
						<Button variant="Ghost" label="← Voltar" onClick={() => navigate(`/cursos/${idCurso}`)} />
					</div>
					<div className="text-center">
						<TituloPrincipal>Materiais do Curso de Regularização Fundiária</TituloPrincipal>
					</div>
					<div className="w-24" />
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
							listToRender.map((material, index) => {
								const key = `${material.type}-${material.id}`;
												if (!isReordering) {
													return (
														<MaterialCard key={key} material={material} index={index} idCurso={idCurso}
															onEdit={(m) => setEditingMaterial(m)}
															onActionComplete={() => loadMaterials()} />
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
														<MaterialCard material={material} index={index} idCurso={idCurso} onEdit={(m) => setEditingMaterial(m)} onActionComplete={() => loadMaterials()} />
													</div>
												);
							})
					)}
				</div>

        		<AddEvaluationSection />
			</div>

		</div>
	);
}
