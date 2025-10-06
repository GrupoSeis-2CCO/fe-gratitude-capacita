import React from "react";
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.js";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import { FileText, Youtube, Play } from 'lucide-react';
import Button from "../components/Button.jsx";

export default function StudentMaterialsListPage() {
	const { getCurrentUserType, isLoggedIn } = useAuth();
	const userType = getCurrentUserType();
	const { idCurso } = useParams();
	const navigate = useNavigate();
	
	// Proteção: apenas colaboradores (tipo 2) podem acessar esta página
	if (!isLoggedIn() || userType !== 2) {
		return <Navigate to="/login" replace />;
	}
	
	// Mock data baseado no Figma
	const mockMaterials = [
		{
			id: 1,
			title: "Introdução",
			type: "video",
			description: "Sobre o material:\nEste material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			status: "concluido"
		},
		{
			id: 2,
			title: "Lorem Ipsum",
			type: "video", 
			description: "Sobre o material:\nEste material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			status: "nao-finalizado"
		},
		{
			id: 3,
			title: "Lorem Ipsum",
			type: "pdf",
			description: "Sobre o material:\nEste material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			status: "a-fazer"
		},
		{
			id: 4,
			title: "Lorem Ipsum",
			type: "pdf",
			description: "Sobre o material:\nEste material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			status: "concluido"
		},
		{
			id: 5,
			title: "Lorem Ipsum",
			type: "video",
			description: "Sobre o material:\nEste material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			status: "a-fazer"
		}
	];

	// Função para obter a cor da barra de status
	const getStatusColor = (status) => {
		switch (status) {
			case 'concluido':
				return 'bg-green-500';
			case 'nao-finalizado':
				return 'bg-red-500';
			case 'a-fazer':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-300';
		}
	};

	// Função para obter o texto do status
	const getStatusText = (status) => {
		switch (status) {
			case 'concluido':
				return 'Concluído';
			case 'nao-finalizado':
				return 'Não Finalizado';
			case 'a-fazer':
				return 'A Fazer';
			default:
				return 'Status';
		}
	};

	const MaterialItem = ({ material, index }) => (
		<div 
			className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 mb-4 relative cursor-pointer hover:shadow-lg transition-shadow"
			onClick={() => navigate(`/cursos/${idCurso}/material/${material.id}`)}
		>
			{/* Barra de status vertical no lado direito */}
			<div className={`absolute top-0 right-0 w-3 h-full rounded-r-lg ${getStatusColor(material.status)}`}></div>
			
			{/* Ícone do material */}
			<div className="w-20 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
				{material.type === 'pdf' ? (
					<FileText size={32} className="text-red-600" />
				) : (
					<div className="relative">
						<div className="w-16 h-12 bg-black rounded flex items-center justify-center">
							<Play size={16} className="text-white ml-1" fill="white" />
						</div>
					</div>
				)}
			</div>

			{/* Conteúdo do material */}
			<div className="flex-1 pr-4">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
						Material {index + 1} - {material.title}
					</h3>
					<span className="text-sm text-gray-500">{getStatusText(material.status)}</span>
				</div>
				<p className="text-sm text-gray-600 whitespace-pre-line">
					{material.description}
				</p>
			</div>
		</div>
	);

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-8">
					<TituloPrincipal>Materiais do Curso x</TituloPrincipal>
				</div>

				{/* Barra de Progresso */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-orange-600">Progresso</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div className="bg-black h-3 rounded-full" style={{ width: '0%' }}></div>
					</div>
				</div>

				{/* Dropdown para ordenação */}
				<div className="mb-6">
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-700">Ordenar por</span>
						<select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
							<option value="">Selecione</option>
							<option value="ordem">Ordem</option>
							<option value="tipo">Tipo</option>
							<option value="status">Status</option>
						</select>
					</div>
				</div>

				{/* Lista de Materiais */}
				<div className="mt-6 w-full">
					{mockMaterials.map((material, index) => (
						<MaterialItem key={material.id} material={material} index={index} />
					))}
				</div>

				{/* Seção de Avaliação Final */}
				<div className="mt-8 bg-orange-100 border-l-4 border-orange-500 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center">
								<FileText size={32} className="text-orange-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800">Avaliação Final</h3>
								<p className="text-sm text-gray-600">10 Questões Objetivas</p>
								<p className="text-sm text-gray-600">Nota mínima: 6/10</p>
							</div>
						</div>
						<Button
							label="Iniciar Avaliação"
							variant="confirm"
							onClick={() => navigate(`/cursos/${idCurso}/material/avaliacao`)}
						/>
					</div>
				</div>

			</div>
		</div>
	);
}