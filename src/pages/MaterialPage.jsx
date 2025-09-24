import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import { FileText, Youtube, ArrowLeft, ArrowRight } from 'lucide-react';

export default function MaterialPage() {
	const { idCurso, idMaterial } = useParams();
	const navigate = useNavigate();

	// Mock data - em uma aplicação real, isso viria de uma API
	const mockMaterials = {
		1: {
			id: "1",
			title: "Introdução à Regularização Fundiária",
			type: "video",
			description: "Este material aborda os conceitos básicos da regularização fundiária, explicando sua importância social, legal e urbana com linguagem clara e acessível ao leitor.",
			duration: "25:45"
		},
		2: {
			id: "2",
			title: "Marco Legal da Regularização Fundiária",
			type: "pdf",
			description: "Documento completo sobre o marco legal brasileiro para regularização fundiária, incluindo a Lei 13.465/2017 e suas implicações práticas para municípios e beneficiários."
		},
		3: {
			id: "3",
			title: "Procedimentos Administrativos",
			type: "video",
			description: "Vídeo explicativo sobre os procedimentos administrativos necessários para implementar projetos de regularização fundiária em áreas urbanas e rurais."
		},
		4: {
			id: "4",
			title: "Instrumentos Urbanísticos",
			type: "pdf",
			description: "Guia prático dos principais instrumentos urbanísticos utilizados em processos de regularização fundiária, com exemplos e casos práticos."
		},
		5: {
			id: "5",
			title: "Participação Social e Comunidade",
			type: "video",
			description: "Como envolver a comunidade nos processos de regularização fundiária, garantindo participação social efetiva e transparente."
		}
	};

	const mockMaterial = mockMaterials[idMaterial] || mockMaterials["1"];
	const courseTitle = "Regularização Fundiária";

	const handleGoBack = () => {
		navigate(`/cursos/${idCurso}/material`);
	};

	const handleNextMaterial = () => {
		// Lógica para próximo material - aqui seria baseado na API real
		const nextMaterialId = parseInt(idMaterial) + 1;
		navigate(`/cursos/${idCurso}/material/${nextMaterialId}`);
	};

	const handlePreviousMaterial = () => {
		// Lógica para material anterior - aqui seria baseado na API real
		const prevMaterialId = parseInt(idMaterial) - 1;
		if (prevMaterialId > 0) {
			navigate(`/cursos/${idCurso}/material/${prevMaterialId}`);
		}
	};

	const renderMaterialContent = () => {
		if (mockMaterial.type === "video") {
			return (
				<div className="bg-black rounded-lg overflow-hidden aspect-video">
					<div className="w-full h-full flex items-center justify-center">
						<div className="flex flex-col items-center text-white">
							<Youtube size={64} className="text-red-600 mb-4" />
							<p className="text-lg">Player de Vídeo</p>
							{mockMaterial.duration && (
								<p className="text-sm opacity-75">Duração: {mockMaterial.duration}</p>
							)}
						</div>
					</div>
				</div>
			);
		} else if (mockMaterial.type === "pdf") {
			return (
				<div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 aspect-video flex items-center justify-center">
					<div className="flex flex-col items-center text-gray-600">
						<FileText size={64} className="mb-4" />
						<p className="text-lg font-medium">Visualizador de PDF</p>
						<Button 
							variant="Default" 
							label="Abrir PDF" 
							onClick={() => {
								// Em uma aplicação real, abriria o PDF
								alert('Função de visualização de PDF será implementada');
							}}
						/>
					</div>
				</div>
			);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-4xl mx-auto flex-grow">
				<div className="text-center mb-8">
					<TituloPrincipal>{courseTitle}</TituloPrincipal>
				</div>

				{/* Breadcrumb */}
				<div className="mb-6">
					<button 
						onClick={handleGoBack}
						className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
					>
						<ArrowLeft size={20} className="mr-2" />
						Voltar aos materiais
					</button>
				</div>

				{/* Material Card */}
				<div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
					{/* Material Header */}
					<div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
						<h2 className="text-2xl font-bold text-white">
							Material {idMaterial} - {mockMaterial.title}
						</h2>
						<div className="flex items-center mt-2 text-orange-100">
							{mockMaterial.type === 'video' ? (
								<Youtube size={20} className="mr-2" />
							) : (
								<FileText size={20} className="mr-2" />
							)}
							<span className="capitalize">{mockMaterial.type}</span>
						</div>
					</div>

					{/* Material Content */}
					<div className="p-6">
						{renderMaterialContent()}
					</div>

					{/* Material Description */}
					<div className="px-6 pb-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-3">Sobre o material:</h3>
						<p className="text-gray-600 leading-relaxed">
							{mockMaterial.description}
						</p>
					</div>

					{/* Navigation Buttons */}
					<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
						<div className="flex justify-between items-center">
							<Button 
								variant="Cancel" 
								label="Material Anterior"
								onClick={handlePreviousMaterial}
								disabled={parseInt(idMaterial) <= 1}
							/>
							
							<div className="flex gap-4">
								<Button 
									variant="Default" 
									label="Marcar como Concluído"
									onClick={() => {
										// Lógica para marcar como concluído
										console.log('Material marcado como concluído');
									}}
								/>
								<Button 
									variant="Confirm" 
									label="Próximo Material"
									onClick={handleNextMaterial}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Progress Indicator */}
				<div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium text-gray-600">Progresso no curso</span>
						<span className="text-sm text-gray-600">Material {idMaterial} de 5</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div 
							className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${(parseInt(idMaterial) / 5) * 100}%` }}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
}